"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const db = new client_1.PrismaClient();
router.post('/google', async (req, res) => {
    const token = req.body.token;
    if (!token)
        return res.status(400).json({ error: 'Missing token' });
    try {
        const { data: profile } = await axios_1.default.get('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${token}` } });
        const { sub: googleId, email, name, picture } = profile;
        let user = await db.user.findUnique({ where: { google_id: googleId } });
        if (!user) {
            const existing = await db.user.findUnique({ where: { email } });
            if (existing) {
                user = await db.user.update({
                    where: { id: existing.id },
                    data: { google_id: googleId }
                });
            }
            else {
                user = await db.user.create({
                    data: { email, google_id: googleId, name, picture_url: picture }
                });
            }
        }
        const jwtToken = jsonwebtoken_1.default.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token: jwtToken });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Login failed' });
    }
});
exports.default = router;
