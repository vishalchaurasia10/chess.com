import { Router } from 'express';
import { getGames, reconnectPlayer } from '../controllers/gameController';

const router = Router();

router.get('/reconnect', reconnectPlayer);
router.post('/get-games', getGames)

export default router;