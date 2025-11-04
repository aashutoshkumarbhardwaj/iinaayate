import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Get current user's support tickets
router.get('/tickets', requireAuth, async (req: AuthRequest, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ tickets });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Create a new support ticket
router.post('/tickets', requireAuth, async (req: AuthRequest, res) => {
  const { subject, message } = req.body as { subject?: string; message?: string };
  if (!subject || !message) return res.status(400).json({ error: 'Missing subject or message' });
  try {
    const ticket = await prisma.supportTicket.create({
      data: { userId: req.userId!, subject, message },
    });
    res.status(201).json(ticket);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

export default router;
