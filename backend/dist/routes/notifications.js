"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /notifications - recent comment activity related to the authenticated user's posts
router.get('/', auth_1.requireAuth, async (req, res) => {
    const userId = req.userId;
    try {
        const comments = await prisma_1.prisma.comment.findMany({
            where: { post: { userId } },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                user: { select: { id: true, name: true, username: true, avatar: true } },
                post: { select: { id: true, title: true } },
            },
        });
        const notifications = comments.map((c) => ({
            id: `comment:${c.id}`,
            type: 'comment',
            user: c.user,
            post: c.post,
            comment: c.content,
            createdAt: c.createdAt.toISOString(),
            read: false,
        }));
        res.json({ notifications });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to load notifications' });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map