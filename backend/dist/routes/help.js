"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get current user's support tickets
router.get('/tickets', auth_1.requireAuth, async (req, res) => {
    try {
        const tickets = await prisma_1.prisma.supportTicket.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ tickets });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});
// Create a new support ticket
router.post('/tickets', auth_1.requireAuth, async (req, res) => {
    const { subject, message } = req.body;
    if (!subject || !message)
        return res.status(400).json({ error: 'Missing subject or message' });
    try {
        const ticket = await prisma_1.prisma.supportTicket.create({
            data: { userId: req.userId, subject, message },
        });
        res.status(201).json(ticket);
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});
exports.default = router;
//# sourceMappingURL=help.js.map