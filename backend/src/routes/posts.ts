import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  const { limit = '20', offset = '0', genre, userId } = req.query as any;
  const take = Math.min(parseInt(limit as string, 10) || 20, 100);
  const skip = parseInt(offset as string, 10) || 0;
  const where: any = {};
  if (genre) where.genre = genre;
  if (userId) where.userId = userId;
  const posts = await prisma.post.findMany({
    where,
    take,
    skip,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, username: true, avatar: true } },
      _count: { select: { comments: true, likes: true, saves: true } },
    },
  });
  res.json(posts);
});

router.get('/top', async (_req, res) => {
  const limit = 5;
  const posts = await prisma.post.findMany({
    take: limit,
    orderBy: { likes: { _count: 'desc' } },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      _count: { select: { likes: true } },
    },
  });
  res.json(
    posts.map(p => ({
      id: p.id,
      title: p.title,
      content: p.content,
      genre: p.genre,
      createdAt: p.createdAt,
      user: p.user,
      likesCount: p._count.likes,
    }))
  );
});

router.get('/saved', requireAuth, async (req: AuthRequest, res) => {
  const saves = await prisma.save.findMany({
    where: { userId: req.userId! },
    include: {
      post: {
        include: {
          user: { select: { id: true, name: true, username: true, avatar: true } },
          _count: { select: { comments: true, likes: true, saves: true } },
        },
      },
    },
  });
  res.json(saves.map((s: any) => s.post));
});

router.get('/:id', async (req, res) => {
  const { id } = req.params as { id: string };
  if (id === 'top') {
    const posts = await prisma.post.findMany({
      take: 5,
      orderBy: { likes: { _count: 'desc' } },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } },
        _count: { select: { likes: true } },
      },
    });
    return res.json(
      posts.map((p: any) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        genre: p.genre,
        createdAt: p.createdAt,
        user: p.user,
        likesCount: p._count.likes,
      }))
    );
  }
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, username: true, avatar: true } },
      _count: { select: { comments: true, likes: true, saves: true } },
    },
  });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { title, content, genre } = req.body as { title: string; content: string; genre: string };
  if (!title || !content || !genre) return res.status(400).json({ error: 'Missing fields' });
  const post = await prisma.post.create({ data: { title, content, genre, userId: req.userId! } });
  res.status(201).json(post);
});

router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  const { title, content, genre } = req.body as { title?: string; content?: string; genre?: string };
  const data: any = {};
  if (title !== undefined) data.title = title;
  if (content !== undefined) data.content = content;
  if (genre !== undefined) data.genre = genre;
  const updated = await prisma.post.update({ where: { id }, data });
  res.json(updated);
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  await prisma.post.delete({ where: { id } });
  res.status(204).send();
});

router.post('/:id/like', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const { action } = req.body as { action: 'like' | 'unlike' };
  if (action === 'like') {
    try { await prisma.like.create({ data: { userId: req.userId!, postId: id } }); } catch {}
    return res.json({ liked: true });
  } else {
    try { await prisma.like.delete({ where: { userId_postId: { userId: req.userId!, postId: id } } }); } catch {}
    return res.json({ liked: false });
  }
});

router.get('/:id/liked', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const like = await prisma.like.findUnique({ where: { userId_postId: { userId: req.userId!, postId: id } } });
  res.json({ liked: !!like });
});

router.post('/:id/save', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const { action } = req.body as { action: 'save' | 'unsave' };
  if (action === 'save') {
    try { await prisma.save.create({ data: { userId: req.userId!, postId: id } }); } catch {}
    return res.json({ saved: true });
  } else {
    try { await prisma.save.delete({ where: { userId_postId: { userId: req.userId!, postId: id } } }); } catch {}
    return res.json({ saved: false });
  }
});

router.get('/:id/comments', async (req, res) => {
  const { id } = req.params as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const comments = await prisma.comment.findMany({
    where: { postId: id },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });
  res.json(comments);
});

router.post('/:id/comments', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const { content } = req.body as { content: string };
  if (!content) return res.status(400).json({ error: 'Missing content' });
  const comment = await prisma.comment.create({ data: { postId: id, userId: req.userId!, content } });
  res.status(201).json(comment);
});

export default router;
