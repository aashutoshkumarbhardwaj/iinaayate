"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/signup', async (req, res) => {
    try {
        const { email, password, username, name } = req.body;
        if (!email || !password || !username || !name)
            return res.status(400).json({ error: 'Missing fields' });
        const existing = await prisma_1.prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
        if (existing)
            return res.status(409).json({ error: 'Email or username already exists' });
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({ data: { email, passwordHash, username, name } });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
        res.json({ user: { id: user.id, email: user.email, username: user.username, name: user.name }, token });
    }
    catch (e) {
        res.status(500).json({ error: 'Signup failed' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Missing fields' });
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(401).json({ error: 'Invalid credentials' });
        const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!ok)
            return res.status(401).json({ error: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
        res.json({ user: { id: user.id, email: user.email, username: user.username, name: user.name }, token });
    }
    catch (e) {
        res.status(500).json({ error: 'Login failed' });
    }
});
// Current user
router.get('/me', auth_1.requireAuth, async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, username: true, name: true, avatar: true, bio: true, _count: { select: { followers: true } } },
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    }
    catch (e) {
        res.status(500).json({ error: 'Failed to fetch current user' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map