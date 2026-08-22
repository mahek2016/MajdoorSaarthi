import { Router } from 'express';
import {
  getMe, updateMe, getJobs, getJobById, applyToJob, getApplications, getWorkerById,
} from '../controllers/workerController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, requireRole('WORKER'), getMe);
router.put('/me', authenticate, requireRole('WORKER'), updateMe);
router.get('/jobs', authenticate, requireRole('WORKER'), getJobs);
router.get('/jobs/:id', authenticate, requireRole('WORKER'), getJobById);
router.post('/jobs/:id/apply', authenticate, requireRole('WORKER'), applyToJob);
router.get('/applications', authenticate, requireRole('WORKER'), getApplications);
router.get('/:id', authenticate, getWorkerById);

export default router;
