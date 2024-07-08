import { Router } from 'express';
import { register, login, verifyjwt } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verifyjwt', verifyjwt)

export default router;
