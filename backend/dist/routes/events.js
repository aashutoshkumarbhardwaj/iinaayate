"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// List events (public)
router.get('/', async (_req, res) => {
    const events = await prisma_1.prisma.event.findMany({
        orderBy: { startsAt: 'desc' },
        include: { _count: { select: { rsvps: true } } },
    });
    res.json({ events: events.map(e => ({ ...e, rsvpsCount: e._count.rsvps })) });
});
// Get single event (public)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: 'Missing id' });
    const event = await prisma_1.prisma.event.findUnique({
        where: { id },
        include: {
            _count: { select: { rsvps: true } },
            rsvps: { take: 12, include: { user: { select: { id: true, name: true, avatar: true } } } },
        },
    });
    if (!event)
        return res.status(404).json({ error: 'Not found' });
    res.json({
        id: event.id,
        title: event.title,
        subtitle: event.subtitle,
        startsAt: event.startsAt,
        location: event.location,
        poster: event.poster,
        createdAt: event.createdAt,
        rsvpsCount: event._count.rsvps,
        attendees: event.rsvps.map(r => ({ id: r.user.id, name: r.user.name, avatar: r.user.avatar })),
    });
});
// RSVP to an event
router.post('/:id/rsvp', auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: 'Missing id' });
    try {
        await prisma_1.prisma.rSVP.create({ data: { userId: req.userId, eventId: id } });
    }
    catch { }
    const count = await prisma_1.prisma.rSVP.count({ where: { eventId: id } });
    res.json({ ok: true, rsvpsCount: count });
});
// Cancel RSVP
router.delete('/:id/rsvp', auth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: 'Missing id' });
    try {
        await prisma_1.prisma.rSVP.delete({ where: { userId_eventId: { userId: req.userId, eventId: id } } });
    }
    catch { }
    const count = await prisma_1.prisma.rSVP.count({ where: { eventId: id } });
    res.json({ ok: true, rsvpsCount: count });
});
// List attendees (paginated)
router.get('/:id/rsvps', async (req, res) => {
    const { id } = req.params;
    const { limit = '20', offset = '0' } = req.query;
    const take = Math.min(parseInt(limit, 10) || 20, 200);
    const skip = parseInt(offset, 10) || 0;
    const rows = await prisma_1.prisma.rSVP.findMany({
        where: { eventId: id },
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, avatar: true } } },
    });
    const total = await prisma_1.prisma.rSVP.count({ where: { eventId: id } });
    res.json({ attendees: rows.map(r => r.user), total });
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