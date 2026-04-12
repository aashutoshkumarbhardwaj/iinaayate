"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const textNormalization_1 = require("../lib/textNormalization");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const q = req.query.q || '';
    const type = (req.query.type || 'all');
    const searchTerms = q ? (0, textNormalization_1.searchForms)(q) : [];
    const romanizedQuery = (0, textNormalization_1.romanizeForSearch)(q);
    const [posts, users] = await Promise.all([
        type !== 'users'
            ? prisma_1.prisma.post.findMany({
                take: q ? 1500 : 50,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, username: true, avatar: true } },
                    _count: { select: { comments: true, likes: true, saves: true } },
                },
            })
            : Promise.resolve([]),
        type !== 'posts'
            ? prisma_1.prisma.user.findMany({
                take: q ? 1500 : 50,
                orderBy: { name: 'asc' },
                select: { id: true, name: true, username: true, avatar: true, _count: { select: { followers: true } } },
            })
            : Promise.resolve([]),
    ]);
    if (!q) {
        return res.json({ posts: posts.slice(0, 50), users: users.slice(0, 50) });
    }
    const filteredPosts = posts
        .filter((post) => (0, textNormalization_1.textMatchesSearch)(post.title, q) ||
        (0, textNormalization_1.textMatchesSearch)(post.content, q) ||
        (0, textNormalization_1.textMatchesSearch)(post.genre, q) ||
        searchTerms.some((term) => [post.title, post.content, post.genre].some((field) => typeof field === 'string' && field.toLowerCase().includes(term))))
        .map((post) => {
        const titleScore = (0, textNormalization_1.scoreSearchMatch)(post.title, q);
        const contentScore = (0, textNormalization_1.scoreSearchMatch)(post.content, q);
        const genreScore = (0, textNormalization_1.scoreSearchMatch)(post.genre, q);
        const ageDays = post.createdAt ? Math.max(0, (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 9999;
        const recencyScore = Math.max(0, 20 - Math.min(20, ageDays / 2));
        return { post, score: titleScore * 4 + contentScore * 2 + genreScore * 3 + recencyScore };
    })
        .sort((a, b) => b.score - a.score)
        .map(({ post }) => post)
        .slice(0, 50);
    const filteredUsers = users
        .filter((user) => (0, textNormalization_1.textMatchesSearch)(user.name, q) ||
        (0, textNormalization_1.textMatchesSearch)(user.username, q) ||
        searchTerms.some((term) => [user.name, user.username].some((field) => typeof field === 'string' && field.toLowerCase().includes(term))))
        .map((user) => {
        const nameScore = (0, textNormalization_1.scoreSearchMatch)(user.name, q);
        const usernameScore = (0, textNormalization_1.scoreSearchMatch)(user.username, q);
        const followerBoost = Math.min(10, user._count?.followers ?? 0);
        return { user, score: Math.max(nameScore, usernameScore) * 3 + followerBoost };
    })
        .sort((a, b) => b.score - a.score)
        .map(({ user }) => user)
        .slice(0, 50);
    res.json({ posts: filteredPosts, users: filteredUsers });
});
exports.default = router;
//# sourceMappingURL=search.js.map