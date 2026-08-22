import { Router } from 'express';
import {
  getMe, updateMe, createProject, getProjects, getWorkforceSummary, getProjectWorkforce,
} from '../controllers/projectController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, requireRole('COMPANY'), getMe);
router.put('/me', authenticate, requireRole('COMPANY'), updateMe);

const projectRouter = Router();
projectRouter.post('/', authenticate, requireRole('COMPANY'), createProject);
projectRouter.get('/', authenticate, requireRole('COMPANY'), getProjects);
projectRouter.get('/workforce-summary', authenticate, requireRole('COMPANY'), getWorkforceSummary);
projectRouter.get('/:id/workforce', authenticate, requireRole('COMPANY'), getProjectWorkforce);

export { router as companyRoutes, projectRouter as projectRoutes };
