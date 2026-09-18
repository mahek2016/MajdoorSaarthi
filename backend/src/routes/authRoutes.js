import { Router } from 'express';
import { signup, login, verifyOTP, selectRole, demoMatch } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/select-role', authenticate, selectRole);
router.post('/demo-match', demoMatch);

export default router;
