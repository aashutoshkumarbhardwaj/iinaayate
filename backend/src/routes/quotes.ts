import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /quotes — list all active quotes (random order, capped at 50)
router.get('/', async (_req, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ quotes });
  } catch {
    res.json({ quotes: [] });
  }
});

// GET /quotes/random — single random active quote
router.get('/random', async (_req, res) => {
  try {
    const count = await prisma.quote.count({ where: { active: true } });
    if (count === 0) return res.json({ quote: null });
    const skip = Math.floor(Math.random() * count);
    const [quote] = await prisma.quote.findMany({
      where: { active: true },
      skip,
      take: 1,
    });
    res.json({ quote: quote ?? null });
  } catch {
    res.json({ quote: null });
  }
});

// POST /quotes — create a new quote (auth required)
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { text, author, context } = req.body as { text: string; author: string; context?: string };
  if (!text?.trim() || !author?.trim()) {
    return res.status(400).json({ error: 'text and author are required' });
  }
  try {
    const quote = await prisma.quote.create({
      data: {
        text: text.trim(),
        author: author.trim(),
        context: context?.trim() ?? null,
      },
    });
    res.status(201).json(quote);
  } catch {
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

export default router;
