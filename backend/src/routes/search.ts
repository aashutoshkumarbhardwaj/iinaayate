import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const router = Router();

router.get('/', async (req, res) => {
  const q = (req.query.q as string) || '';
  const type = ((req.query.type as string) || 'all') as 'all' | 'posts' | 'users';
  const wherePost: Prisma.PostWhereInput = q
    ? {
        OR: [
          { title: { contains: q } },
          { content: { contains: q } },
          { genre: { contains: q } },
        ],
      }
    : {};
  const whereUser: Prisma.UserWhereInput = q
    ? {
        OR: [
          { name: { contains: q } },
          { username: { contains: q } },
        ],
      }
    : {};

  const [posts, users] = await Promise.all([
    type !== 'users'
      ? prisma.post.findMany({
          where: wherePost,
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, username: true, avatar: true } },
            _count: { select: { comments: true, likes: true, saves: true } },
          },
        })
      : Promise.resolve([]),
    type !== 'posts'
      ? prisma.user.findMany({
          where: whereUser,
          take: 50,
          select: { id: true, name: true, username: true, avatar: true, _count: { select: { followers: true } } },
        })
      : Promise.resolve([]),
  ]);

  res.json({ posts, users });
});

export default router;
