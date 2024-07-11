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

export const getGames = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const games = await Game.find({ $or: [{ player1: email }, { player2: email }] });

        if (games.length === 0) {
            return res.status(404).json({ error: 'No games found for this email' });
        }

        res.status(200).json(games);
    } catch (error) {
        console.error('Error fetching games:', error); // Debugging log
        res.status(500).json({ error: 'Failed to get games' });
    }
};