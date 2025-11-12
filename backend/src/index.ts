import 'dotenv/config';
import express from 'express';
import { prisma } from './lib/prisma';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import searchRoutes from './routes/search';
import notificationsRoutes from './routes/notifications';
import helpRoutes from './routes/help';
import storeRoutes from './routes/store';
import eventsRoutes from './routes/events';
import collectionsRoutes from './routes/collections';
import transliterateRoutes from './routes/transliterate';

const app = express();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3001',
        FRONTEND_ORIGIN,
      ].filter(Boolean) as string[];
      if (!origin) return cb(null, true);
      const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
      if (allowed.includes(origin) || isLocalhost) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

// Simple request logger to debug routes
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Mount routers
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/search', searchRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/help', helpRoutes);
app.use('/store', storeRoutes);
app.use('/events', eventsRoutes);
app.use('/collections', collectionsRoutes);
app.use('/transliterate', transliterateRoutes);

// Fallback list users (mirrors router logic)
app.get('/users', async (req, res) => {
  try {
    console.log('Handling fallback GET /users');
    const { limit = '24', offset = '0', startsWith, sort = 'popularity' } = req.query as any;
    const take = Math.min(parseInt(limit as string, 10) || 24, 200);
    const skip = parseInt(offset as string, 10) || 0;
    const where: any = {};
    if (startsWith && typeof startsWith === 'string') {
      where.name = { startsWith, mode: 'insensitive' };
    }
    const orderBy = sort === 'name' ? [{ name: 'asc' as const }] : [{ followers: { _count: 'desc' as const } }];
    const [total, rows] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        take,
        skip,
        orderBy,
        select: { id: true, name: true, username: true, avatar: true, _count: { select: { followers: true, posts: true } } },
      }),
    ]);
    const users = rows.map((u: any) => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, followersCount: u._count.followers, postsCount: u._count.posts }));
    res.json({ users, total });
  } catch (e) {
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// Community stats
app.get('/stats/community', async (_req, res) => {
  try {
    const [totalPoems, activePoets, newThisWeek] = await Promise.all([
      prisma.post.count(),
      prisma.user.count({ where: { posts: { some: {} } } }),
      prisma.post.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    ]);
    res.json({ totalPoems, activePoets, newThisWeek });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load community stats' });
  }
});

app.get('/health', (_req: express.Request, res: express.Response) => res.json({ ok: true }));

// Fallback direct handlers (safety net if router path matching fails)
app.get('/posts/top', async (_req, res) => {
  try {
    console.log('Handling fallback GET /posts/top');
    const posts = await prisma.post.findMany({
      take: 5,
      orderBy: { likes: { _count: 'desc' } },
      include: { user: { select: { id: true, name: true, avatar: true } }, _count: { select: { likes: true } } },
    });
    res.json(posts.map((p: any) => ({ id: p.id, title: p.title, content: p.content, genre: p.genre, createdAt: p.createdAt, user: p.user, likesCount: p._count.likes })));
  } catch (e) {
    res.status(500).json({ error: 'Failed to load top posts' });
  }
});

app.get('/users/top', async (_req, res) => {
  try {
    console.log('Handling fallback GET /users/top');
    const users = await prisma.user.findMany({
      take: 8,
      orderBy: { followers: { _count: 'desc' } },
      select: { id: true, name: true, username: true, avatar: true, _count: { select: { followers: true } } },
    });
    res.json(users.map((u: any) => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, followersCount: u._count.followers })));
  } catch (e) {
    res.status(500).json({ error: 'Failed to load top users' });
  }
});

// Fallback direct handlers for public resources
app.get('/events', async (_req, res) => {
  try {
    console.log('Handling fallback GET /events');
    const events = await prisma.event.findMany({
      orderBy: { startsAt: 'asc' },
      take: 50,
    });
    res.json(events);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load events' });
  }
});

app.get('/store/products', async (_req, res) => {
  try {
    console.log('Handling fallback GET /store/products');
    const products = await prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' }, take: 100 });
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// Explicit aliases for quick diagnosis (should return same data)
app.get('/top-posts', async (_req, res) => {
  try {
    console.log('Handling alias GET /top-posts');
    const posts = await prisma.post.findMany({
      take: 5,
      orderBy: { likes: { _count: 'desc' } },
      include: { user: { select: { id: true, name: true, avatar: true } }, _count: { select: { likes: true } } },
    });
    res.json(posts.map((p: any) => ({ id: p.id, title: p.title, content: p.content, genre: p.genre, createdAt: p.createdAt, user: p.user, likesCount: p._count.likes })));
  } catch (e) {
    res.status(500).json({ error: 'Failed to load top posts (alias)' });
  }
});

app.get('/top-users', async (_req, res) => {
  try {
    console.log('Handling alias GET /top-users');
    const users = await prisma.user.findMany({
      take: 8,
      orderBy: { followers: { _count: 'desc' } },
      select: { id: true, name: true, username: true, avatar: true, _count: { select: { followers: true } } },
    });
    res.json(users.map((u: any) => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, followersCount: u._count.followers })));
  } catch (e) {
    res.status(500).json({ error: 'Failed to load top users (alias)' });
  }
});

app.get('/public/events', async (_req, res) => {
  try {
    console.log('Handling alias GET /public/events');
    const events = await prisma.event.findMany({ orderBy: { startsAt: 'asc' }, take: 50 });
    res.json(events);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load events (alias)' });
  }
});

app.get('/public/products', async (_req, res) => {
  try {
    console.log('Handling alias GET /public/products');
    const products = await prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' }, take: 100 });
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load products (alias)' });
  }
});

// Handle Chrome DevTools discovery file to avoid 404 noise in console
app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req: express.Request, res: express.Response) => {
  res.type('application/json').status(200).send('{}');
});

app.use('/auth', authRoutes);
console.log('Mounted /auth');
app.use('/users', userRoutes);
console.log('Mounted /users');
app.use('/posts', postRoutes);
console.log('Mounted /posts');
app.use('/search', searchRoutes);
console.log('Mounted /search');
app.use('/notifications', notificationsRoutes);
console.log('Mounted /notifications');
app.use('/help', helpRoutes);
console.log('Mounted /help');
app.use('/store', storeRoutes);
console.log('Mounted /store');
app.use('/events', eventsRoutes);
console.log('Mounted /events');
app.use('/collections', collectionsRoutes);
console.log('Mounted /collections');
app.use('/transliterate', transliterateRoutes);
console.log('Mounted /transliterate');

// Root status endpoint for primary URL
app.get('/', (_req: express.Request, res: express.Response) => {
  res.status(200).json({
    ok: true,
    name: 'iinaayate-api',
    version: '1.0.0',
    docs: '/health',
  });
});

// Simple request logger to debug 404s
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] 404 ${req.method} ${req.path}`);
  next();
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
