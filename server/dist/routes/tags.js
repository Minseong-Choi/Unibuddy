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
    const tags = await prisma_1.default.tag.findMany({
        where: { projectId },
        orderBy: { name: 'asc' },
    });
    res.json(tags);
});
router.post('/', async (req, res) => {
    const projectId = Number(req.params.projectId);
    const userId = req.userId;
    const { name } = req.body;
    if (!name)
        return res.status(400).json({ error: '태그명이 필요합니다.' });
    const proj = await prisma_1.default.project.findUnique({
        where: { id: projectId, userId }
    });
    if (!proj)
        return res.status(404).json({ error: '프로젝트가 없거나 권한이 없습니다.' });
    // 프로젝트-태그 연결
    const tag = await prisma_1.default.tag.create({
        data: { name, projectId },
    });
    res.json(tag);
});
router.delete('/:tagId', async (req, res) => {
    const projectId = Number(req.params.projectId);
    const tagId = Number(req.params.tagId);
    const userId = req.userId;
    // 소유권 확인
    const proj = await prisma_1.default.project.findUnique({
        where: { id: projectId, userId }
    });
    if (!proj)
        return res.status(404).json({ error: '프로젝트가 없거나 권한이 없습니다.' });
    // 연결 해제
    await prisma_1.default.tag.delete({
        where: { id: tagId }
    });
    res.json({ success: true });
});
exports.default = router;
