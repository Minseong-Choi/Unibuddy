import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authMiddleware } from '../middleware/auth';

type ReqWithParams = Request<{ projectId: string }, any, any>;

const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get('/', async (req: ReqWithParams, res: Response) => {
  const projectId = Number(req.params.projectId);
  const userId    = req.userId!;

  const proj = await prisma.project.findUnique({
    where: { id: projectId, userId }
  });
  if (!proj) return res.status(404).json({ error: '프로젝트가 없거나 권한이 없습니다.' });

  const tags = await prisma.tag.findMany({
    where: { projectId },
    orderBy: { name: 'asc' },
  });
  res.json(tags);
});


  router.post('/', async (req: Request, res: Response) => {
    const projectId = Number(req.params.projectId);
    const userId    = req.userId!;
    const { name }  = req.body;
    if (!name) return res.status(400).json({ error: '태그명이 필요합니다.' });
  
    const proj = await prisma.project.findUnique({
      where: { id: projectId, userId }
    });
    if (!proj) return res.status(404).json({ error: '프로젝트가 없거나 권한이 없습니다.' });
  
     // 프로젝트-태그 연결
     const tag = await prisma.tag.create({
      data: { name, projectId },
    });

  res.json(tag);
});

router.delete('/:tagId', async (req: Request, res: Response) => {
  const projectId = Number(req.params.projectId);
  const tagId     = Number(req.params.tagId);
  const userId    = req.userId!;

  // 소유권 확인
  const proj = await prisma.project.findUnique({
    where: { id: projectId, userId }
  });
  if (!proj) return res.status(404).json({ error: '프로젝트가 없거나 권한이 없습니다.' });

  // 연결 해제
  await prisma.tag.delete({
    where: { id: tagId }
  });

  res.json({ success: true });
});

export default router;