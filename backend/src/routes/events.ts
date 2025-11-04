import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// List events (public)
router.get('/', async (_req, res) => {
  const events = await prisma.event.findMany({ orderBy: { startsAt: 'desc' } });
  res.json({ events });
});

// Get single event (public)
router.get('/:id', async (req, res) => {
  const { id } = req.params as { id: string };
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return res.status(404).json({ error: 'Not found' });
  res.json(event);
});

// Create event (temporary: auth required; later restrict to admin)
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { title, subtitle, startsAt, location, poster } = req.body as {
    title?: string;
    subtitle?: string;
    startsAt?: string;
    location?: string;
    poster?: string;
  };
  if (!title || !startsAt || !location) return res.status(400).json({ error: 'Missing fields' });
  const event = await prisma.event.create({
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

export default router;
