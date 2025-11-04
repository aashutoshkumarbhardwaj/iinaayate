import { Router } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, username, name } = req.body as { email: string; password: string; username: string; name: string };
    if (!email || !password || !username || !name) return res.status(400).json({ error: 'Missing fields' });
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) return res.status(409).json({ error: 'Email or username already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash, username, name } });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email, username: user.username, name: user.name }, token });
  } catch (e: any) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email, username: user.username, name: user.name }, token });
  } catch (e: any) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Current user
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { id: true, email: true, username: true, name: true, avatar: true, bio: true, _count: { select: { followers: true } } },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

export default router;
