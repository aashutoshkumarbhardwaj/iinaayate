import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import { cloudinary, cloudinaryConfigured } from '../lib/cloudinary';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// List users with pagination and filters
router.get('/', async (req, res) => {
  const { limit = '24', offset = '0', startsWith, sort = 'popularity' } = req.query as any;
  const take = Math.min(parseInt(limit as string, 10) || 24, 200);
  const skip = parseInt(offset as string, 10) || 0;
  const where: any = {};
  if (startsWith && typeof startsWith === 'string') {
    where.name = { startsWith, mode: 'insensitive' };
  }
  const orderBy =
    sort === 'name'
      ? [{ name: 'asc' as const }]
      : [{ followers: { _count: 'desc' as const } }];
  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      take,
      skip,
      orderBy,
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        _count: { select: { followers: true, posts: true } },
      },
    }),
  ]);
  const users = rows.map(u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    avatar: u.avatar,
    followersCount: u._count.followers,
    postsCount: u._count.posts,
  }));
  res.json({ users, total });
});

// Upload avatar image and update user.avatar
router.post('/:id/avatar', requireAuth, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) return res.status(400).json({ error: 'Missing id' });
    if (req.userId !== id) return res.status(403).json({ error: 'Forbidden' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!cloudinaryConfigured) return res.status(501).json({ error: 'Image upload not configured' });

    const buffer = req.file.buffer;
    const url: string = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'iinaayate/avatars', resource_type: 'image', transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'auto' }] },
        (err: any, result: any) => {
          if (err || !result?.secure_url) return reject(err || new Error('Upload failed'));
          resolve(result.secure_url as string);
        }
      );
      stream.end(buffer);
    });

    await prisma.user.update({ where: { id }, data: { avatar: url } });
    return res.json({ url });
  } catch (e) {
    return res.status(500).json({ error: 'Avatar upload failed' });
  }
});

router.get('/top', async (_req, res) => {
  const limit = 8;
  const users = await prisma.user.findMany({
    take: limit,
    orderBy: { followers: { _count: 'desc' } },
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      _count: { select: { followers: true } },
    },
  });
  res.json(users.map(u => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, followersCount: u._count.followers })));
});

router.get('/:id', async (req, res) => {
  const { id } = req.params as { id: string };
  if (id === 'top') {
    const users = await prisma.user.findMany({
      take: 8,
      orderBy: { followers: { _count: 'desc' } },
      select: { id: true, name: true, username: true, avatar: true, _count: { select: { followers: true } } },
    });
    return res.json(users.map(u => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, followersCount: u._count.followers })));
  }
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      name: true,
      avatar: true,
      bio: true,
      createdAt: true,
      _count: { select: { posts: true, followers: true, following: true } },
    },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing id' });
  if (req.userId !== id) return res.status(403).json({ error: 'Forbidden' });
  const { name, avatar, bio, username } = req.body as { name?: string; avatar?: string; bio?: string; username?: string };
  try {
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (avatar !== undefined) data.avatar = avatar;
    if (bio !== undefined) data.bio = bio;
    if (username !== undefined) data.username = username;
    const updated = await prisma.user.update({ where: { id }, data });
    res.json({ id: updated.id, username: updated.username, name: updated.name, avatar: updated.avatar, bio: updated.bio });
  } catch (e) {
    res.status(400).json({ error: 'Update failed' });
  }
});

router.post('/:id/follow', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const { action } = req.body as { action: 'follow' | 'unfollow' };
  if (!action) return res.status(400).json({ error: 'Missing action' });
  if (req.userId === id) return res.status(400).json({ error: 'Cannot follow yourself' });
  try {
    if (action === 'follow') {
      await prisma.follow.create({ data: { followerId: req.userId!, followeeId: id } });
    } else {
      await prisma.follow.delete({ where: { followerId_followeeId: { followerId: req.userId!, followeeId: id } } });
    }
    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: true });
  }
});

router.get('/:id/following', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const rel = await prisma.follow.findUnique({ where: { followerId_followeeId: { followerId: req.userId!, followeeId: id } } });
  res.json({ following: !!rel });
});

export default router;
