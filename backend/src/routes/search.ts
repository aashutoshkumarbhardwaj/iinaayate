import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { romanizeForSearch, scoreSearchMatch, searchForms, textMatchesSearch } from '../lib/textNormalization';

const router = Router();

router.get('/', async (req, res) => {
  const q = (req.query.q as string) || '';
  const type = ((req.query.type as string) || 'all') as 'all' | 'posts' | 'users';
  const searchTerms = q ? searchForms(q) : [];
  const romanizedQuery = romanizeForSearch(q);

  const [posts, users] = await Promise.all([
    type !== 'users'
      ? prisma.post.findMany({
          take: q ? 1500 : 50,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, username: true, avatar: true } },
            _count: { select: { comments: true, likes: true, saves: true } },
          },
        })
      : Promise.resolve([] as any[]),
    type !== 'posts'
      ? prisma.user.findMany({
          take: q ? 1500 : 50,
          orderBy: { name: 'asc' },
          select: { id: true, name: true, username: true, avatar: true, _count: { select: { followers: true } } },
        })
      : Promise.resolve([] as any[]),
  ]);

  if (!q) {
    return res.json({ posts: posts.slice(0, 50), users: users.slice(0, 50) });
  }

  const filteredPosts = posts
    .filter((post: any) =>
      textMatchesSearch(post.title, q) ||
      textMatchesSearch(post.content, q) ||
      textMatchesSearch(post.genre, q) ||
      searchTerms.some((term) =>
        [post.title, post.content, post.genre].some((field) => typeof field === 'string' && field.toLowerCase().includes(term))
      )
    )
    .map((post: any) => {
      const titleScore = scoreSearchMatch(post.title, q);
      const contentScore = scoreSearchMatch(post.content, q);
      const genreScore = scoreSearchMatch(post.genre, q);
      const ageDays = post.createdAt ? Math.max(0, (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 9999;
      const recencyScore = Math.max(0, 20 - Math.min(20, ageDays / 2));
      return { post, score: titleScore * 4 + contentScore * 2 + genreScore * 3 + recencyScore };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ post }) => post)
    .slice(0, 50);

  const filteredUsers = users
    .filter((user: any) =>
      textMatchesSearch(user.name, q) ||
      textMatchesSearch(user.username, q) ||
      searchTerms.some((term) =>
        [user.name, user.username].some((field) => typeof field === 'string' && field.toLowerCase().includes(term))
      )
    )
    .map((user: any) => {
      const nameScore = scoreSearchMatch(user.name, q);
      const usernameScore = scoreSearchMatch(user.username, q);
      const followerBoost = Math.min(10, user._count?.followers ?? 0);
      return { user, score: Math.max(nameScore, usernameScore) * 3 + followerBoost };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ user }) => user)
    .slice(0, 50);

  res.json({ posts: filteredPosts, users: filteredUsers });
});

export default router;
