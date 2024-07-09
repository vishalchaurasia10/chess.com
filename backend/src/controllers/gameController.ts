import { Request, Response } from 'express';
import Game from "../models/gameModel";

export const reconnectPlayer = async (req: Request, res: Response) => {
    const { gameId, player } = req.body;

    try {
        const game = await Game.findOne({ gameId });

        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        // Validate if the player is part of the game
        if (game.player1 !== player && game.player2 !== player) {
            return res.status(403).json({ error: 'Player not part of the game' });
        }

        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ error: 'Failed to reconnect' });
    }
}