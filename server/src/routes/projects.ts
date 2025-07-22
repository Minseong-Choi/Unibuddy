import { Router } from 'express';
import prisma from '../prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware); // middleware를 통과해서 접근가능하도록

router.get('/', async (req, res) => {
    const userId = (req as any).userId;
    const list = await prisma.project.findMany({
        where: {userId},
        orderBy: {createdAt: 'desc'},
    });
    res.json(list);
});

router.get('/:id', async (req, res) => {
    const userId    = (req as any).userId;
    const projectId = Number(req.params.id);

    const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
        select: { id: true, name: true, createdAt: true },
      });
    
      if (!project) {
        return res.status(404).json({ error: '프로젝트를 찾을 수 없거나 권한이 없습니다.' });
      }
      res.json(project);
});


router.post('/', async (req, res) => {
    const userId = (req as any).userId;
    const { name } = req.body;
    if(!name) return res.status(400).json({ error: '이름 필요' });
    const project = await prisma.project.create({
        data: { name, userId },
    });
    res.json(project);
});

router.delete('/:id', async (req, res) => {
    const userId = (req as any).userId;
    const id = Number(req.params.id);
    const found = await prisma.project.findUnique({where:{id}});
    if(!found || found.userId !== userId){
        return res.status(404).json({ error: '권한 없음 또는 존재하지 않음'});
    }
    await prisma.project.delete({where: {id}});
    res.json({ success: true});
});

export default router;