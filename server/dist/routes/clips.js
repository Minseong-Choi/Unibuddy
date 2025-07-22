"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_1.authMiddleware);
router.get('/', async (req, res) => {
    const projectId = Number(req.params.projectId);
    const userId = req.userId;
    const proj = await prisma_1.default.project.findUnique({
        where: { id: projectId, userId }
    });
    if (!proj)
        return res.status(404).json({ error: '프로젝트가 없거나 권한이 없습니다.' });
    const clips = await prisma_1.default.clip.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' }
    });
    res.json(clips);
});
router.post('/', async (req, res) => {
    const projectId = Number(req.params.projectId);
    const userId = req.userId;
    const { tag, url, content } = req.body;
    if (!url || !content) {
        return res.status(400).json({ error: 'URL과 content는 필수입니다.' });
    }
    // 소유권 체크
    const proj = await prisma_1.default.project.findUnique({
        where: { id: projectId, userId }
    });
    if (!proj)
        return res.status(404).json({ error: '프로젝트가 없거나 권한이 없습니다.' });
    const clip = await prisma_1.default.clip.create({
        data: { projectId, tag, url, content }
    });
    res.status(201).json(clip);
});
router.delete('/:clipId', async (req, res) => {
    const projectId = Number(req.params.projectId);
    const clipId = Number(req.params.clipId);
    const userId = req.userId;
    // 소유권 체크
    const proj = await prisma_1.default.project.findUnique({
        where: { id: projectId, userId }
    });
    if (!proj)
        return res.status(404).json({ error: '프로젝트가 없거나 권한이 없습니다.' });
    await prisma_1.default.clip.delete({ where: { id: clipId } });
    res.json({ success: true });
});
exports.default = router;
