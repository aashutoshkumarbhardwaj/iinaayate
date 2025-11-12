import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import jwt from 'jsonwebtoken';

const router = Router();

function getUserIdFromAuth(req: any): string | undefined {
  const header = req.headers?.['authorization'];
  if (!header) return undefined;
  const token = (header as string).split(' ')[1];
  if (!token) return undefined;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    if (typeof payload === 'object' && payload && 'userId' in payload) {
      return (payload as any).userId as string;
    }
  } catch {}
  return undefined;
}

router.get('/', async (req, res) => {
  const { limit = '20', offset = '0', genre, userId, mood, hasAudio } = req.query as any;
  const take = Math.min(parseInt(limit as string, 10) || 20, 200);
  const skip = parseInt(offset as string, 10) || 0;
  const where: any = {};
  if (genre) where.genre = genre;
  if (userId) where.userId = userId;
  if (mood) where.mood = mood;
  if (hasAudio === 'true') where.audioUrl = { not: null };
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
  const authUserId = getUserIdFromAuth(req);
  if (!authUserId) return res.json(posts);
  const ids = posts.map((p: any) => p.id);
  if (ids.length === 0) return res.json(posts);
  const liked = await prisma.like.findMany({
    where: { userId: authUserId, postId: { in: ids } },
    select: { postId: true },
  });
  const likedSet = new Set(liked.map(l => l.postId));
  const withLiked = posts.map((p: any) => ({
    ...p,
    isLiked: likedSet.has(p.id),
    likesCount: p._count?.likes,
  }));
  res.json(withLiked);
});

router.get('/top', async (req, res) => {
  const limit = 5;
  const posts = await prisma.post.findMany({
    take: limit,
    orderBy: { likes: { _count: 'desc' } },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      _count: { select: { likes: true } },
    },
  });
  const authUserId = getUserIdFromAuth(req);
  let likedSet = new Set<string>();
  if (authUserId && posts.length > 0) {
    const liked = await prisma.like.findMany({
      where: { userId: authUserId, postId: { in: posts.map(p => p.id) } },
      select: { postId: true },
    });
    likedSet = new Set(liked.map(l => l.postId));
  }
  res.json(
    posts.map(p => ({
      id: p.id,
      title: p.title,
      content: p.content,
      genre: p.genre,
      createdAt: p.createdAt,
      user: p.user,
      likesCount: p._count.likes,
      isLiked: likedSet.has(p.id),
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
    const authUserIdTop = getUserIdFromAuth(req);
    let likedSetTop = new Set<string>();
    if (authUserIdTop && posts.length > 0) {
      const liked = await prisma.like.findMany({
        where: { userId: authUserIdTop, postId: { in: posts.map((p: any) => p.id) } },
        select: { postId: true },
      });
      likedSetTop = new Set(liked.map(l => l.postId));
    }
    return res.json(
      posts.map((p: any) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        genre: p.genre,
        createdAt: p.createdAt,
        user: p.user,
        likesCount: p._count.likes,
        isLiked: likedSetTop.has(p.id),
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
  const authUserId = getUserIdFromAuth(req);
  if (!authUserId) return res.json(post);
  const like = await prisma.like.findUnique({ where: { userId_postId: { userId: authUserId, postId: id } } });
  return res.json({ ...post, isLiked: !!like, likesCount: post._count?.likes });
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { title, content, genre, mood, audioUrl } = req.body as { title: string; content: string; genre: string; mood?: string; audioUrl?: string };
  if (!title || !content || !genre) return res.status(400).json({ error: 'Missing fields' });
  const post = await prisma.post.create({ data: { title, content, genre, mood: mood ?? null, audioUrl: audioUrl ?? null, userId: req.userId! } });
  res.status(201).json(post);
});

router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
  const { title, content, genre, mood, audioUrl } = req.body as { title?: string; content?: string; genre?: string; mood?: string | null; audioUrl?: string | null };
  const data: any = {};
  if (title !== undefined) data.title = title;
  if (content !== undefined) data.content = content;
  if (genre !== undefined) data.genre = genre;
  if (mood !== undefined) data.mood = mood;
  if (audioUrl !== undefined) data.audioUrl = audioUrl;
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
