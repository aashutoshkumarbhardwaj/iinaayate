"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const prisma_1 = require("./lib/prisma");
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const posts_1 = __importDefault(require("./routes/posts"));
const search_1 = __importDefault(require("./routes/search"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const help_1 = __importDefault(require("./routes/help"));
const store_1 = __importDefault(require("./routes/store"));
const events_1 = __importDefault(require("./routes/events"));
const collections_1 = __importDefault(require("./routes/collections"));
const transliterate_1 = __importDefault(require("./routes/transliterate"));
const app = (0, express_1.default)();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        const allowed = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3001',
            FRONTEND_ORIGIN,
        ].filter(Boolean);
        if (!origin)
            return cb(null, true);
        const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
        if (allowed.includes(origin) || isLocalhost)
            return cb(null, true);
        return cb(null, false);
    },
    credentials: true,
}));
app.use(express_1.default.json());
// Simple request logger to debug routes
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Mount routers
app.use('/auth', auth_1.default);
app.use('/users', users_1.default);
app.use('/posts', posts_1.default);
app.use('/search', search_1.default);
app.use('/notifications', notifications_1.default);
app.use('/help', help_1.default);
app.use('/store', store_1.default);
app.use('/events', events_1.default);
app.use('/collections', collections_1.default);
app.use('/transliterate', transliterate_1.default);
// Fallback list users (mirrors router logic)
app.get('/users', async (req, res) => {
    try {
        console.log('Handling fallback GET /users');
        const { limit = '24', offset = '0', startsWith, sort = 'popularity' } = req.query;
        const take = Math.min(parseInt(limit, 10) || 24, 200);
        const skip = parseInt(offset, 10) || 0;
        const where = {};
        if (startsWith && typeof startsWith === 'string') {
            where.name = { startsWith, mode: 'insensitive' };
        }
        const orderBy = sort === 'name' ? [{ name: 'asc' }] : [{ followers: { _count: 'desc' } }];
        const [total, rows] = await Promise.all([
            prisma_1.prisma.user.count({ where }),
            prisma_1.prisma.user.findMany({
                where,
                take,
                skip,
                orderBy,
                select: { id: true, name: true, username: true, avatar: true, _count: { select: { followers: true, posts: true } } },
            }),
        ]);
        const users = rows.map((u) => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, followersCount: u._count.followers, postsCount: u._count.posts }));
        res.json({ users, total });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to list users' });
    }
});
// Community stats
app.get('/stats/community', async (_req, res) => {
    try {
        const [totalPoems, activePoets, newThisWeek] = await Promise.all([
            prisma_1.prisma.post.count(),
            prisma_1.prisma.user.count({ where: { posts: { some: {} } } }),
            prisma_1.prisma.post.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
        ]);
        res.json({ totalPoems, activePoets, newThisWeek });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to load community stats' });
    }
});
app.get('/health', (_req, res) => res.json({ ok: true }));
// Fallback direct handlers (safety net if router path matching fails)
app.get('/posts/top', async (_req, res) => {
    try {
        console.log('Handling fallback GET /posts/top');
        const posts = await prisma_1.prisma.post.findMany({
            take: 5,
            orderBy: { likes: { _count: 'desc' } },
            include: { user: { select: { id: true, name: true, avatar: true } }, _count: { select: { likes: true } } },
        });
        res.json(posts.map((p) => ({ id: p.id, title: p.title, content: p.content, genre: p.genre, createdAt: p.createdAt, user: p.user, likesCount: p._count.likes })));
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to load top posts' });
    }
});
app.get('/users/top', async (_req, res) => {
    try {
        console.log('Handling fallback GET /users/top');
        const users = await prisma_1.prisma.user.findMany({
            take: 8,
            orderBy: { followers: { _count: 'desc' } },
            select: { id: true, name: true, username: true, avatar: true, _count: { select: { followers: true } } },
        });
        res.json(users.map((u) => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, followersCount: u._count.followers })));
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to load top users' });
    }
});
// Fallback direct handlers for public resources
app.get('/events', async (_req, res) => {
    try {
        console.log('Handling fallback GET /events');
        const events = await prisma_1.prisma.event.findMany({
            orderBy: { startsAt: 'asc' },
            take: 50,
        });
        res.json(events);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to load events' });
    }
});
app.get('/store/products', async (_req, res) => {
    try {
        console.log('Handling fallback GET /store/products');
        const products = await prisma_1.prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' }, take: 100 });
        res.json(products);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to load products' });
    }
});
// Explicit aliases for quick diagnosis (should return same data)
app.get('/top-posts', async (_req, res) => {
    try {
        console.log('Handling alias GET /top-posts');
        const posts = await prisma_1.prisma.post.findMany({
            take: 5,
            orderBy: { likes: { _count: 'desc' } },
            include: { user: { select: { id: true, name: true, avatar: true } }, _count: { select: { likes: true } } },
        });
        res.json(posts.map((p) => ({ id: p.id, title: p.title, content: p.content, genre: p.genre, createdAt: p.createdAt, user: p.user, likesCount: p._count.likes })));
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to load top posts (alias)' });
    }
});
app.get('/top-users', async (_req, res) => {
    try {
        console.log('Handling alias GET /top-users');
        const users = await prisma_1.prisma.user.findMany({
            take: 8,
            orderBy: { followers: { _count: 'desc' } },
            select: { id: true, name: true, username: true, avatar: true, _count: { select: { followers: true } } },
        });
        res.json(users.map((u) => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, followersCount: u._count.followers })));
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to load top users (alias)' });
    }
});
app.get('/public/events', async (_req, res) => {
    try {
        console.log('Handling alias GET /public/events');
        const events = await prisma_1.prisma.event.findMany({ orderBy: { startsAt: 'asc' }, take: 50 });
        res.json(events);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to load events (alias)' });
    }
});
app.get('/public/products', async (_req, res) => {
    try {
        console.log('Handling alias GET /public/products');
        const products = await prisma_1.prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' }, take: 100 });
        res.json(products);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to load products (alias)' });
    }
});
// Handle Chrome DevTools discovery file to avoid 404 noise in console
app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => {
    res.type('application/json').status(200).send('{}');
});
app.use('/auth', auth_1.default);
console.log('Mounted /auth');
app.use('/users', users_1.default);
console.log('Mounted /users');
app.use('/posts', posts_1.default);
console.log('Mounted /posts');
app.use('/search', search_1.default);
console.log('Mounted /search');
app.use('/notifications', notifications_1.default);
console.log('Mounted /notifications');
app.use('/help', help_1.default);
console.log('Mounted /help');
app.use('/store', store_1.default);
console.log('Mounted /store');
app.use('/events', events_1.default);
console.log('Mounted /events');
app.use('/collections', collections_1.default);
console.log('Mounted /collections');
app.use('/transliterate', transliterate_1.default);
console.log('Mounted /transliterate');
// Simple request logger to debug 404s
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] 404 ${req.method} ${req.path}`);
    next();
});
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map