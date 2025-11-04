"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public: list active products
router.get('/products', async (_req, res) => {
    const products = await prisma_1.prisma.product.findMany({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ products });
});
// Simple create endpoint to seed products (temporary; restrict later)
router.post('/products', auth_1.requireAuth, async (req, res) => {
    const { title, description, price, image, active } = req.body;
    if (!title || !description || typeof price !== 'number') {
        return res.status(400).json({ error: 'Missing fields' });
    }
    const product = await prisma_1.prisma.product.create({
        data: { title, description, price, image: image ?? null, active: active ?? true },
    });
    res.status(201).json(product);
});
exports.default = router;
//# sourceMappingURL=store.js.map