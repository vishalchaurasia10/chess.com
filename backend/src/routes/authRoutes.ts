import { Router } from 'express';
import { register, login, verifyjwt } from '../controllers/authController';
import { googleAuth, googleAuthCallback } from '../middleware/passportConfig';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verifyjwt', verifyjwt)
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);

export default router;
