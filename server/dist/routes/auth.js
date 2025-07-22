"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
router.post('/google', async (req, res) => {
    const token = req.body.token;
    if (!token)
        return res.status(400).json({ error: 'Missing token' });
    try {
        const { data: profile } = await axios_1.default.get('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${token}` } });
        const { sub: googleId, email, name, picture } = profile;
        let user = await prisma_1.default.user.findUnique({ where: { google_id: googleId } });
        if (!user) {
            const existing = await prisma_1.default.user.findUnique({ where: { email } });
            if (existing) {
                user = await prisma_1.default.user.update({
                    where: { id: existing.id },
                    data: { google_id: googleId }
                });
            }
            else {
                user = await prisma_1.default.user.create({
                    data: { email, google_id: googleId, name }
                });
            }
        }
        const jwtToken = jsonwebtoken_1.default.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token: jwtToken });
    }
    catch (err) {
        console.error('🔥 /auth/google error:', err);
        // Axios 요청 실패라면 응답 상태와 데이터도 찍어 보기
        console.error('  axios status:', err.response?.status);
        console.error('  axios data:  ', err.response?.data);
        // JWT 발급 중 에러라면 err.message 로 확인
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
