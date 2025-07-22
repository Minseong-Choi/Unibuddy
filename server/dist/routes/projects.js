"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware); // middleware를 통과해서 접근가능하도록
router.get('/', async (req, res) => {
    const userId = req.userId;
    const list = await prisma_1.default.project.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
    res.json(list);
});
router.get('/:id', async (req, res) => {
    const userId = req.userId;
    const projectId = Number(req.params.id);
    const project = await prisma_1.default.project.findFirst({
        where: { id: projectId, userId },
        select: { id: true, name: true, createdAt: true },
    });
    if (!project) {
        return res.status(404).json({ error: '프로젝트를 찾을 수 없거나 권한이 없습니다.' });
    }
    res.json(project);
});
router.post('/', async (req, res) => {
    const userId = req.userId;
    const { name } = req.body;
    if (!name)
        return res.status(400).json({ error: '이름 필요' });
    const project = await prisma_1.default.project.create({
        data: { name, userId },
    });
    res.json(project);
});
router.delete('/:id', async (req, res) => {
    const userId = req.userId;
    const id = Number(req.params.id);
    const found = await prisma_1.default.project.findUnique({ where: { id } });
    if (!found || found.userId !== userId) {
        return res.status(404).json({ error: '권한 없음 또는 존재하지 않음' });
    }
    await prisma_1.default.project.delete({ where: { id } });
    res.json({ success: true });
});
exports.default = router;
