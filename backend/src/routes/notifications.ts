import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /notifications - recent comment activity related to the authenticated user's posts
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  try {
    const comments = await prisma.comment.findMany({
      where: { post: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } },
        post: { select: { id: true, title: true } },
      },
    });

    const notifications = comments.map((c) => ({
      id: `comment:${c.id}`,
      type: 'comment' as const,
      user: c.user,
      post: c.post,
      comment: c.content,
      createdAt: c.createdAt.toISOString(),
      read: false,
    }));

    res.json({ notifications });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

export default router;
