import { Router } from 'express';
import { getMe, updateMe, searchWorkers, getContractorAttendance, getContractorStats, getContractorAnalytics } from '../controllers/contractorController.js';
import {
  createJob, getMyJobs, getSuggestedWorkers, hireWorker, getMatches,
  confirmHire, completeJob, rateWorker, createHouseholdRequest
} from '../controllers/jobController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, requireRole('CONTRACTOR'), getMe);
router.put('/me', authenticate, requireRole('CONTRACTOR'), updateMe);
router.get('/workers', authenticate, requireRole('CONTRACTOR'), searchWorkers);
router.get('/attendance', authenticate, requireRole('CONTRACTOR'), getContractorAttendance);
router.get('/stats', authenticate, requireRole('CONTRACTOR'), getContractorStats);
router.get('/analytics', authenticate, requireRole('CONTRACTOR'), getContractorAnalytics);

const jobRouter = Router();
jobRouter.post('/', authenticate, requireRole('CONTRACTOR'), createJob);
jobRouter.get('/my-jobs', authenticate, requireRole('CONTRACTOR'), getMyJobs);
jobRouter.get('/:id/workers', authenticate, requireRole('CONTRACTOR'), getSuggestedWorkers);
jobRouter.get('/:jobId/matches', authenticate, requireRole('CONTRACTOR'), getMatches);
jobRouter.post('/:id/hire', authenticate, requireRole('CONTRACTOR'), hireWorker);
jobRouter.post('/:id/confirm-hire', authenticate, requireRole('CONTRACTOR'), confirmHire);
jobRouter.post('/:id/complete', authenticate, requireRole('CONTRACTOR'), completeJob);
jobRouter.post('/:id/rate-worker', authenticate, requireRole('CONTRACTOR'), rateWorker);
jobRouter.post('/household-request', authenticate, requireRole('CONTRACTOR'), createHouseholdRequest);

export { router as contractorRoutes, jobRouter as jobRoutes };
