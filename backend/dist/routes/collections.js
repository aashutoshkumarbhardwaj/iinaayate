"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get current user's collections
router.get('/', auth_1.requireAuth, async (req, res) => {
    const collections = await prisma_1.prisma.collection.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            title: true,
            description: true,
            isPublic: true,
            createdAt: true,
            user: { select: { name: true } },
            _count: { select: { items: true } },
        },
    });
    res.json({
        collections: collections.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            isPublic: c.isPublic,
            createdAt: c.createdAt,
            itemCount: c._count.items,
            ownerName: c.user?.name ?? null,
        })),
    });
});
// Create a collection
router.post('/', auth_1.requireAuth, async (req, res) => {
    const { title, description, isPublic } = req.body;
    if (!title)
        return res.status(400).json({ error: 'Missing title' });
    const created = await prisma_1.prisma.collection.create({
        data: {
            userId: req.userId,
            title,
            description: description || null,
            isPublic: typeof isPublic === 'string' ? isPublic === 'public' : (isPublic ?? true),
        },
    });
    res.status(201).json(created);
});
exports.default = router;
//# sourceMappingURL=collections.js.map