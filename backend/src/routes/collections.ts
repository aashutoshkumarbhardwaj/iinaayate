import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Get current user's collections
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const collections = await prisma.collection.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      isPublic: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
  });
  res.json({ collections: collections.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    isPublic: c.isPublic,
    createdAt: c.createdAt,
    itemCount: c._count.items,
  })) });
});

// Create a collection
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { title, description, isPublic } = req.body as { title?: string; description?: string; isPublic?: boolean | string };
  if (!title) return res.status(400).json({ error: 'Missing title' });
  const created = await prisma.collection.create({
    data: {
      userId: req.userId!,
      title,
      description: description || null,
      isPublic: typeof isPublic === 'string' ? isPublic === 'public' : (isPublic ?? true),
    },
  });
  res.status(201).json(created);
});

export default router;
