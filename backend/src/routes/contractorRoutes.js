import { Router } from 'express';
import { getMe, updateMe } from '../controllers/contractorController.js';
import {
  createJob, getMyJobs, getSuggestedWorkers, hireWorker, getMatches,
} from '../controllers/jobController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, requireRole('CONTRACTOR'), getMe);
router.put('/me', authenticate, requireRole('CONTRACTOR'), updateMe);

const jobRouter = Router();
jobRouter.post('/', authenticate, requireRole('CONTRACTOR'), createJob);
jobRouter.get('/my-jobs', authenticate, requireRole('CONTRACTOR'), getMyJobs);
jobRouter.get('/:id/workers', authenticate, requireRole('CONTRACTOR'), getSuggestedWorkers);
jobRouter.get('/:jobId/matches', authenticate, requireRole('CONTRACTOR'), getMatches);
jobRouter.post('/:id/hire', authenticate, requireRole('CONTRACTOR'), hireWorker);

export { router as contractorRoutes, jobRouter as jobRoutes };
