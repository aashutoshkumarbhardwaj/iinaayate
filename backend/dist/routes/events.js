"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// List events (public)
router.get('/', async (_req, res) => {
    const events = await prisma_1.prisma.event.findMany({ orderBy: { startsAt: 'desc' } });
    res.json({ events });
});
// Get single event (public)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: 'Missing id' });
    const event = await prisma_1.prisma.event.findUnique({ where: { id } });
    if (!event)
        return res.status(404).json({ error: 'Not found' });
    res.json(event);
});
// Create event (temporary: auth required; later restrict to admin)
router.post('/', auth_1.requireAuth, async (req, res) => {
    const { title, subtitle, startsAt, location, poster } = req.body;
    if (!title || !startsAt || !location)
        return res.status(400).json({ error: 'Missing fields' });
    const event = await prisma_1.prisma.event.create({
        data: {
            title,
            subtitle: subtitle ?? null,
            startsAt: new Date(startsAt),
            location,
            poster: poster ?? null,
        },
    });
    res.status(201).json(event);
});
exports.default = router;
//# sourceMappingURL=events.js.map