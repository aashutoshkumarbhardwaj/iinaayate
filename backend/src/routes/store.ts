import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Public: list active products
router.get('/products', async (_req, res) => {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ products });
});

// Simple create endpoint to seed products (temporary; restrict later)
router.post('/products', requireAuth, async (req: AuthRequest, res) => {
  const { title, description, price, image, active } = req.body as {
    title?: string;
    description?: string;
    price?: number;
    image?: string;
    active?: boolean;
  };
  if (!title || !description || typeof price !== 'number') {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const product = await prisma.product.create({
    data: { title, description, price, image: image ?? null, active: active ?? true },
  });
  res.status(201).json(product);
});

export default router;
