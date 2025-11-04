"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const { limit = '20', offset = '0', genre, userId } = req.query;
    const take = Math.min(parseInt(limit, 10) || 20, 100);
    const skip = parseInt(offset, 10) || 0;
    const where = {};
    if (genre)
        where.genre = genre;
    if (userId)
        where.userId = userId;
    const posts = await prisma_1.prisma.post.findMany({
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
    const posts = await prisma_1.prisma.post.findMany({
        take: limit,
        orderBy: { likes: { _count: 'desc' } },
        include: {
            user: { select: { id: true, name: true, avatar: true } },
            _count: { select: { likes: true } },
        },
    });
    res.json(posts.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        genre: p.genre,
        createdAt: p.createdAt,
        user: p.user,
        likesCount: p._count.likes,
    })));
});
router.get('/saved', auth_1.requireAuth, async (req, res) => {
    const saves = await prisma_1.prisma.save.findMany({
        where: { userId: req.userId },
        include: {
            post: {
                include: {
                    user: { select: { id: true, name: true, username: true, avatar: true } },
                    _count: { select: { comments: true, likes: true, saves: true } },
                },
            },
        },
    });
    res.json(saves.map((s) => s.post));
});
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (id === 'top') {
        const posts = await prisma_1.prisma.post.findMany({
            take: 5,
            orderBy: { likes: { _count: 'desc' } },
            include: {
                user: { select: { id: true, name: true, username: true, avatar: true } },
                _count: { select: { likes: true } },
            },
        });
        return res.json(posts.map((p) => ({
            id: p.id,
            title: p.title,
            content: p.content,
            genre: p.genre,
            createdAt: p.createdAt,
            user: p.user,
            likesCount: p._count.likes,
        })));
    }
    if (!id)
        return res.status(400).json({ error: 'Missing id' });
    const post = await prisma_1.prisma.post.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, username: true, avatar: true } },
            _count: { select: { comments: true, likes: true, saves: true } },
        },
    });
    if (!post)
        return res.status(404).json({ error: 'Post not found' });
    res.json(post);
});
router.post('/', auth_1.requireAuth, async (req, res) => {
    const { title, content, genre } = req.body;
    if (!title || !content || !genre)
        return res.status(400).json({ error: 'Missing fields' });
    const post = await prisma_1.prisma.post.create({ data: { title, content, genre, userId: req.userId } });
    res.status(201).json(post);
});
router.put('/:id', auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: 'Missing id' });
    const existing = await prisma_1.prisma.post.findUnique({ where: { id } });
    if (!existing)
        return res.status(404).json({ error: 'Not found' });
    if (existing.userId !== req.userId)
        return res.status(403).json({ error: 'Forbidden' });
    const { title, content, genre } = req.body;
    const data = {};
    if (title !== undefined)
        data.title = title;
    if (content !== undefined)
        data.content = content;
    if (genre !== undefined)
        data.genre = genre;
    const updated = await prisma_1.prisma.post.update({ where: { id }, data });
    res.json(updated);
});
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: 'Missing id' });
    const existing = await prisma_1.prisma.post.findUnique({ where: { id } });
    if (!existing)
        return res.status(404).json({ error: 'Not found' });
    if (existing.userId !== req.userId)
        return res.status(403).json({ error: 'Forbidden' });
    await prisma_1.prisma.post.delete({ where: { id } });
    res.status(204).send();
});
router.post('/:id/like', auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: 'Missing id' });
    const { action } = req.body;
    if (action === 'like') {
        try {
            await prisma_1.prisma.like.create({ data: { userId: req.userId, postId: id } });
        }
        catch { }
        return res.json({ liked: true });
    }
    else {
        try {
            await prisma_1.prisma.like.delete({ where: { userId_postId: { userId: req.userId, postId: id } } });
        }
        catch { }
        return res.json({ liked: false });
    }
});
router.get('/:id/liked', auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: 'Missing id' });
    const like = await prisma_1.prisma.like.findUnique({ where: { userId_postId: { userId: req.userId, postId: id } } });
    res.json({ liked: !!like });
});
router.post('/:id/save', auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: 'Missing id' });
    const { action } = req.body;
    if (action === 'save') {
        try {
            await prisma_1.prisma.save.create({ data: { userId: req.userId, postId: id } });
        }
        catch { }
        return res.json({ saved: true });
    }
    else {
        try {
            await prisma_1.prisma.save.delete({ where: { userId_postId: { userId: req.userId, postId: id } } });
        }
        catch { }
        return res.json({ saved: false });
    }
});
router.get('/:id/comments', async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: 'Missing id' });
    const comments = await prisma_1.prisma.comment.findMany({
        where: { postId: id },
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, name: true, avatar: true } } },
    });
    res.json(comments);
});
router.post('/:id/comments', auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: 'Missing id' });
    const { content } = req.body;
    if (!content)
        return res.status(400).json({ error: 'Missing content' });
    const comment = await prisma_1.prisma.comment.create({ data: { postId: id, userId: req.userId, content } });
    res.status(201).json(comment);
});
exports.default = router;
//# sourceMappingURL=posts.js.map