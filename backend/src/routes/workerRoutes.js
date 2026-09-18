import { Router } from 'express';
import {
  getMe, updateMe, getJobs, getJobById, applyToJob, getApplications, getWorkerById, verifyKyc,
  respondToApplication, getTodayAttendance, checkIn, checkOut,
} from '../controllers/workerController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, requireRole('WORKER'), getMe);
router.put('/me', authenticate, requireRole('WORKER'), updateMe);
router.put('/me/kyc', authenticate, requireRole('WORKER'), verifyKyc);
router.get('/jobs', authenticate, requireRole('WORKER'), getJobs);
router.get('/jobs/:id', authenticate, requireRole('WORKER'), getJobById);
router.post('/jobs/:id/apply', authenticate, requireRole('WORKER'), applyToJob);
router.get('/applications', authenticate, requireRole('WORKER'), getApplications);
router.post('/applications/:id/respond', authenticate, requireRole('WORKER'), respondToApplication);
router.get('/attendance/today', authenticate, requireRole('WORKER'), getTodayAttendance);
router.post('/attendance/check-in', authenticate, requireRole('WORKER'), checkIn);
router.post('/attendance/check-out', authenticate, requireRole('WORKER'), checkOut);
router.get('/:id', authenticate, getWorkerById);

export default router;
