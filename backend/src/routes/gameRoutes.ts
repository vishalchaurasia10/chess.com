import { Router } from 'express';
import { reconnectPlayer } from '../controllers/gameController';

const router = Router();

router.get('/reconnect', reconnectPlayer);

export default router;