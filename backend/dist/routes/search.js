"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const textNormalization_1 = require("../lib/textNormalization");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const q = req.query.q || '';
    const type = (req.query.type || 'all');
    const normalizedQuery = (0, textNormalization_1.simplifyText)(q).trim();
    const needsNormalizationSearch = !!q && ((0, textNormalization_1.hasUnicodeDiacritics)(q) || normalizedQuery !== q.trim());
    if (needsNormalizationSearch) {
        const [posts, users] = await Promise.all([
            type !== 'users'
                ? prisma_1.prisma.post.findMany({
                    take: 1000,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { id: true, name: true, username: true, avatar: true } },
                        _count: { select: { comments: true, likes: true, saves: true } },
                    },
                })
                : Promise.resolve([]),
            type !== 'posts'
                ? prisma_1.prisma.user.findMany({
                    take: 1000,
                    orderBy: { name: 'asc' },
                    select: { id: true, name: true, username: true, avatar: true, _count: { select: { followers: true } } },
                })
                : Promise.resolve([]),
        ]);
        const filteredPosts = posts.filter((post) => (0, textNormalization_1.textMatchesSearch)(post.title, q) ||
            (0, textNormalization_1.textMatchesSearch)(post.content, q) ||
            (0, textNormalization_1.textMatchesSearch)(post.genre, q)).slice(0, 50);
        const filteredUsers = users.filter((user) => (0, textNormalization_1.textMatchesSearch)(user.name, q) ||
            (0, textNormalization_1.textMatchesSearch)(user.username, q)).slice(0, 50);
        return res.json({ posts: filteredPosts, users: filteredUsers });
    }
    const wherePost = q
        ? {
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { content: { contains: q, mode: 'insensitive' } },
                { genre: { contains: q, mode: 'insensitive' } },
            ],
        }
        : {};
    const whereUser = q
        ? {
            OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { username: { contains: q, mode: 'insensitive' } },
            ],
        }
        : {};
    const [posts, users] = await Promise.all([
        type !== 'users'
            ? prisma_1.prisma.post.findMany({
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
            ? prisma_1.prisma.user.findMany({
                where: whereUser,
                take: 50,
                select: { id: true, name: true, username: true, avatar: true, _count: { select: { followers: true } } },
            })
            : Promise.resolve([]),
    ]);
    res.json({ posts, users });
});
exports.default = router;
//# sourceMappingURL=search.js.map