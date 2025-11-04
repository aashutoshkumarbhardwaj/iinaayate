"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    const header = req.headers['authorization'];
    if (!header)
        return res.status(401).json({ error: 'Missing Authorization header' });
    const token = header.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Invalid Authorization header' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'dev');
        if (typeof payload !== 'object' || payload === null || !('userId' in payload)) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.userId = payload.userId;
        next();
    }
    catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
//# sourceMappingURL=auth.js.map