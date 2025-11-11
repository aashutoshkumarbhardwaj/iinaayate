"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// List users with pagination and filters
router.get('/', async (req, res) => {
    const { limit = '24', offset = '0', startsWith, sort = 'popularity' } = req.query;
    const take = Math.min(parseInt(limit, 10) || 24, 200);
    const skip = parseInt(offset, 10) || 0;
    const where = {};
    if (startsWith && typeof startsWith === 'string') {
        where.name = { startsWith, mode: 'insensitive' };
    }
    const orderBy = sort === 'name'
        ? [{ name: 'asc' }]
        : [{ followers: { _count: 'desc' } }];
    const [total, rows] = await Promise.all([
        prisma_1.prisma.user.count({ where }),
        prisma_1.prisma.user.findMany({
            where,
            take,
            skip,
            orderBy,
            select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                _count: { select: { followers: true, posts: true } },
            },
        }),
    ]);
    const users = rows.map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        followersCount: u._count.followers,
        postsCount: u._count.posts,
    }));
    res.json({ users, total });
});
router.get('/top', async (_req, res) => {
    const limit = 8;
    const users = await prisma_1.prisma.user.findMany({
        take: limit,
        orderBy: { followers: { _count: 'desc' } },
        select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            _count: { select: { followers: true } },
        },
    });
    res.json(users.map(u => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, followersCount: u._count.followers })));
});
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (id === 'top') {
        const users = await prisma_1.prisma.user.findMany({
            take: 8,
            orderBy: { followers: { _count: 'desc' } },
            select: { id: true, name: true, username: true, avatar: true, _count: { select: { followers: true } } },
        });
        return res.json(users.map(u => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, followersCount: u._count.followers })));
    }
    if (!id)
        return res.status(400).json({ error: 'Missing id' });
    const user = await prisma_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            bio: true,
            createdAt: true,
            _count: { select: { posts: true, followers: true, following: true } },
        },
    });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    res.json(user);
});
router.put('/:id', auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: 'Missing id' });
    if (req.userId !== id)
        return res.status(403).json({ error: 'Forbidden' });
    const { name, avatar, bio, username } = req.body;
    try {
        const data = {};
        if (name !== undefined)
            data.name = name;
        if (avatar !== undefined)
            data.avatar = avatar;
        if (bio !== undefined)
            data.bio = bio;
        if (username !== undefined)
            data.username = username;
        const updated = await prisma_1.prisma.user.update({ where: { id }, data });
        res.json({ id: updated.id, username: updated.username, name: updated.name, avatar: updated.avatar, bio: updated.bio });
    }
    catch (e) {
        res.status(400).json({ error: 'Update failed' });
    }
});
router.post('/:id/follow', auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: 'Missing id' });
    const { action } = req.body;
    if (!action)
        return res.status(400).json({ error: 'Missing action' });
    if (req.userId === id)
        return res.status(400).json({ error: 'Cannot follow yourself' });
    try {
        if (action === 'follow') {
            await prisma_1.prisma.follow.create({ data: { followerId: req.userId, followeeId: id } });
        }
        else {
            await prisma_1.prisma.follow.delete({ where: { followerId_followeeId: { followerId: req.userId, followeeId: id } } });
        }
        res.json({ ok: true });
    }
    catch (e) {
        res.json({ ok: true });
    }
});
router.get('/:id/following', auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: 'Missing id' });
    const rel = await prisma_1.prisma.follow.findUnique({ where: { followerId_followeeId: { followerId: req.userId, followeeId: id } } });
    res.json({ following: !!rel });
});
exports.default = router;
//# sourceMappingURL=users.js.map