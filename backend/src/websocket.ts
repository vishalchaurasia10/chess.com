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
type MessageType = 'init_game' | 'move' | 'reconnect';

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
    console.log('total clients', wss.clients.size);

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
                    JSON.stringify({ type: 'game_started', gameId, board: chess.fen(), turn: pendingUser.userEmail })
                );
                ws.send(
                    JSON.stringify({ type: 'game_started', gameId, board: chess.fen(), turn: pendingUser.userEmail })
                );

                pendingUser = null;
            } else {
                pendingUser = ws;
                ws.userEmail = userEmail;
                ws.send(JSON.stringify({ type: 'waiting_for_opponent' }));
            }
            break;

        case 'move':
            const { from, to, gameId } = message.payload;
            console.log('gameid:', gameId)
            const gameData = games[gameId];

            if (!gameData) {
                console.log('Game not found');
                return;
            }

            const game = gameData.game;
            const currentTurn = gameData.turn;

            if (currentTurn !== userEmail) {
                ws.send(JSON.stringify({ type: 'error', message: 'Not your turn' }));
                return;
            }

            try {
                const moveResult = game.move({ from, to });
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

        case 'reconnect':
            const prevGameId = message.payload.gameId;
            const disconnectedUserEmail = message.payload.userEmail;
            console.log('Reconnect:', prevGameId, disconnectedUserEmail);
            console.log('games:', games);

            if (!games[prevGameId]) {
                ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
                return;
            }

            const preGameData = games[prevGameId];

            if (preGameData.player1 !== disconnectedUserEmail && preGameData.player2 !== disconnectedUserEmail) {
                ws.send(JSON.stringify({ type: 'error', message: 'User not part of this game' }));
                return;
            }

            ws.gameId = prevGameId;
            ws.userEmail = disconnectedUserEmail;

            ws.send(
                JSON.stringify({
                    type: 'board_update',
                    board: preGameData.game.fen(),
                    turn: preGameData.turn,
                })
            );

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

        ws.on('close', () => {
            console.log('Client disconnected');
        });

        ws.send(JSON.stringify({ type: 'welcome', payload: 'Hello! Message From Server!!' }));
    });

    // Heartbeat to check if connection is alive
    setInterval(() => {
        wss.clients.forEach((ws) => {
            const wsExtended = ws as WebSocketExtended;
            if (!wsExtended.isAlive) {
                wsExtended.terminate();
                console.log('Terminated a stale connection');
            } else {
                wsExtended.isAlive = false;
                wsExtended.ping();
            }
        });
    }, 30000);

    return wss;
};

export default setupWebSocket;