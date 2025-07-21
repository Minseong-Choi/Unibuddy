import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authMiddleware } from '../middleware/auth';

interface ReqWithParams extends Request {
    params: { 
        projectId: string;
        clipId?: string;
    };
    userId?: number;
}

const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get('/', async (req: ReqWithParams, res: Response) => {
    const projectId = Number(req.params.projectId);
    const userId    = req.userId!;

    const proj = await prisma.project.findUnique({
    where: { id: projectId, userId }
    });
    if (!proj) return res.status(404).json({ error: '프로젝트가 없거나 권한이 없습니다.' });

    const clips = await prisma.clip.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' }
    });
    res.json(clips);
}
);

router.post(
'/',
async (req: ReqWithParams, res: Response) => {
    const projectId = Number(req.params.projectId);
    const userId    = req.userId!;
    const { tag, url, content } = req.body as { tag?: string; url: string; content: string };

    if (!url || !content) {
    return res.status(400).json({ error: 'URL과 content는 필수입니다.' });
    }
    // 소유권 체크
    const proj = await prisma.project.findUnique({
    where: { id: projectId, userId }
    });
    if (!proj) return res.status(404).json({ error: '프로젝트가 없거나 권한이 없습니다.' });

    const clip = await prisma.clip.create({
    data: { projectId, tag, url, content }
    });
    res.status(201).json(clip);
}
);

router.delete(
    '/:clipId',
    async (req: ReqWithParams, res: Response) => {
      const projectId = Number(req.params.projectId);
      const clipId    = Number(req.params.clipId);
      const userId    = req.userId!;
  
      // 소유권 체크
      const proj = await prisma.project.findUnique({
        where: { id: projectId, userId }
      });
      if (!proj) return res.status(404).json({ error: '프로젝트가 없거나 권한이 없습니다.' });
  
      await prisma.clip.delete({ where: { id: clipId } });
      res.json({ success: true });
    }
  );
  
  export default router;