import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { hasUnicodeDiacritics, simplifyText, textMatchesSearch } from '../lib/textNormalization';

const router = Router();

router.get('/', async (req, res) => {
  const q = (req.query.q as string) || '';
  const type = ((req.query.type as string) || 'all') as 'all' | 'posts' | 'users';
  const normalizedQuery = simplifyText(q).trim();
  const needsNormalizationSearch = !!q && (hasUnicodeDiacritics(q) || normalizedQuery !== q.trim());

  if (needsNormalizationSearch) {
    const [posts, users] = await Promise.all([
      type !== 'users'
        ? prisma.post.findMany({
            take: 1000,
            orderBy: { createdAt: 'desc' },
            include: {
              user: { select: { id: true, name: true, username: true, avatar: true } },
              _count: { select: { comments: true, likes: true, saves: true } },
            },
          })
        : Promise.resolve([] as any[]),
      type !== 'posts'
        ? prisma.user.findMany({
            take: 1000,
            orderBy: { name: 'asc' },
            select: { id: true, name: true, username: true, avatar: true, _count: { select: { followers: true } } },
          })
        : Promise.resolve([] as any[]),
    ]);

    const filteredPosts = posts.filter((post: any) =>
      textMatchesSearch(post.title, q) ||
      textMatchesSearch(post.content, q) ||
      textMatchesSearch(post.genre, q)
    ).slice(0, 50);

    const filteredUsers = users.filter((user: any) =>
      textMatchesSearch(user.name, q) ||
      textMatchesSearch(user.username, q)
    ).slice(0, 50);

    return res.json({ posts: filteredPosts, users: filteredUsers });
  }

  const wherePost: Prisma.PostWhereInput = q
    ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
          { genre: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {};
  const whereUser: Prisma.UserWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { username: { contains: q, mode: 'insensitive' } },
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
