import WebSocket from 'ws';
import http from 'http';
import { Chess } from 'chess.js'; // Import chess.js library
import Game from './models/gameModel';
import User from './models/userModel';

interface WebSocketExtended extends WebSocket {
    isAlive: boolean;
    gameId?: string;
    userEmail?: string;
}

// Message Types
type MessageType = 'init_game' | 'move';

interface Message {
    type: MessageType;
    payload: any;
}

let pendingUser: WebSocketExtended | null = null;
const games: {
    [key: string]: {
        game: Chess;
        turn: string;
        player1: string;
        player2: string;
    };
} = {};

// Function to handle different message types
const handleMessage = async (message: Message, ws: WebSocketExtended, wss: WebSocket.Server) => {
    const { userEmail } = message.payload;

    switch (message.type) {
        case 'init_game':
            console.log('Init game:', userEmail);
            if (pendingUser) {
                const chess = new Chess();
                const newGame = new Game({
                    player1: pendingUser.userEmail,
                    player2: userEmail,
                    turn: pendingUser.userEmail,
                });
                const savedGame = await newGame.save();

                const gameId = savedGame._id.toString();
                games[gameId] = {
                    game: chess,
                    turn: pendingUser.userEmail!,
                    player1: pendingUser.userEmail!,
                    player2: userEmail,
                };

                pendingUser.gameId = gameId;
                ws.gameId = gameId;

                pendingUser.send(
                    JSON.stringify({ type: 'game_started', gameId, board: chess.fen() })
                );
                ws.send(
                    JSON.stringify({ type: 'game_started', gameId, board: chess.fen() })
                );

                pendingUser = null;
            } else {
                pendingUser = ws;
                ws.userEmail = userEmail;
                ws.send(JSON.stringify({ type: 'waiting_for_opponent' }));
            }
            break;

        case 'move':
            console.log('Move:', message.payload);
            const { from, to, gameId } = message.payload;
            const gameData = games[gameId];

            if (!gameData) {
                console.log('Game not found');
                return;
            }

            const game = gameData.game;
            const currentTurn = gameData.turn;

            if (currentTurn !== userEmail) {
                console.log('Not your turn');
                ws.send(JSON.stringify({ type: 'error', message: 'Not your turn' }));
                return;
            }

            try {
                const moveResult = game.move({ from, to });
                console.log('Move made:', moveResult);
                const updatedBoard = game.fen();
                // Update the turn in the game state
                gameData.turn = game.turn() === 'w' ? gameData.player1 : gameData.player2;

                // Update the board state in the database
                await Game.updateOne(
                    { _id: gameId },
                    { board: updatedBoard, turn: gameData.turn }
                );

                // Emit updated board state to both players
                wss.clients.forEach((client) => {
                    const extendedClient = client as WebSocketExtended;
                    if (extendedClient.gameId === gameId) {
                        extendedClient.send(
                            JSON.stringify({
                                type: 'board_update',
                                board: updatedBoard,
                                turn: gameData.turn,
                            })
                        );
                    }
                });
            } catch (error) {
                console.log('Invalid move:', message.payload);
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }));
            }
            break;
        default:
            console.log('Unknown message type', message.type);
    }
};

// WebSocket setup function
const setupWebSocket = (server: http.Server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws: WebSocketExtended) => {
        ws.isAlive = true;

        ws.on('pong', () => {
            ws.isAlive = true;
        });

        ws.on('message', (data) => {
            try {
                const message: Message = JSON.parse(data.toString());
                handleMessage(message, ws, wss);
            } catch (error) {
                console.error('Invalid message format', error);
            }
        });

        ws.send(JSON.stringify({ type: 'welcome', payload: 'Hello! Message From Server!!' }));
    });

    // Heartbeat to check if connection is alive
    setInterval(() => {
        wss.clients.forEach((ws) => {
            const wsExtended = ws as WebSocketExtended;
            if (!wsExtended.isAlive) return wsExtended.terminate();

            wsExtended.isAlive = false;
            wsExtended.ping(undefined, false, (err: Error) => {
                if (err) {
                    console.error('Ping error:', err);
                    wsExtended.terminate();
                }
            });
        });
    }, 30000);

    return wss;
};

export default setupWebSocket;