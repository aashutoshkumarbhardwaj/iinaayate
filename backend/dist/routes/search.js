"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const q = req.query.q || '';
    const type = (req.query.type || 'all');
    const wherePost = q
        ? {
            OR: [
                { title: { contains: q } },
                { content: { contains: q } },
                { genre: { contains: q } },
            ],
        }
        : {};
    const whereUser = q
        ? {
            OR: [
                { name: { contains: q } },
                { username: { contains: q } },
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