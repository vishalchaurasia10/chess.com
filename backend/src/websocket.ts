import WebSocket from 'ws';
import http from 'http';
import { Chess } from 'chess.js'; // Import chess.js library
import Game from './models/gameModel';
import User from './models/userModel';

interface WebSocketExtended extends WebSocket {
    isAlive: boolean;
    gameId?: string;
    userEmail?: string;
    timer?: NodeJS.Timeout;
}

// Message Types
type MessageType = 'init_game' | 'move' | 'reconnect' | 'promotion';

interface Message {
    type: MessageType;
    payload: any;
}

let pendingUser: WebSocketExtended | null = null;
interface GameData {
    game: Chess;
    turn: string;
    player1: string;
    player2: string;
    timers: {
        player1: number;
        player2: number;
    };
    timerIntervals: {
        player1: NodeJS.Timeout | null;
        player2: NodeJS.Timeout | null;
    };
    result?: string;
}

const games: { [key: string]: GameData } = {};

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
                    timers: {
                        player1: 10 * 60 * 1000,
                        player2: 10 * 60 * 1000,
                    },
                });
                const savedGame = await newGame.save();

                const gameId = savedGame._id.toString();
                games[gameId] = {
                    game: chess,
                    turn: pendingUser.userEmail!,
                    player1: pendingUser.userEmail!,
                    player2: userEmail,
                    timers: {
                        player1: 10 * 60 * 1000, // 5 minutes in milliseconds
                        player2: 10 * 60 * 1000,
                    },
                    timerIntervals: {
                        player1: null,
                        player2: null,
                    },
                    result: 'ongoing',
                };

                pendingUser.gameId = gameId;
                ws.gameId = gameId;

                startTimer(gameId, 'player1', wss);

                pendingUser.send(
                    JSON.stringify({ type: 'game_started', gameId, board: chess.fen(), turn: pendingUser.userEmail, color: 'white' })
                );
                ws.send(
                    JSON.stringify({ type: 'game_started', gameId, board: chess.fen(), turn: pendingUser.userEmail, color: 'black' })
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
                game.move({ from, to });
                const updatedBoard = game.fen();

                // Update the turn in the game state
                gameData.turn = game.turn() === 'w' ? gameData.player1 : gameData.player2;

                if (game.isCheckmate()) {
                    const winner = gameData.turn === gameData.player1 ? gameData.player2 : gameData.player1;
                    gameData.result = winner;
                    await Game.updateOne(
                        { _id: gameId },
                        { board: updatedBoard, turn: gameData.turn, result: winner }
                    );
                    wss.clients.forEach((client) => {
                        const extendedClient = client as WebSocketExtended;
                        if (extendedClient.gameId === gameId) {
                            extendedClient.send(
                                JSON.stringify({
                                    type: 'game_over',
                                    winner,
                                    draw: false,
                                })
                            );
                        }
                    });
                    delete games[gameId];
                } else if (game.isDraw()) {
                    gameData.result = 'draw';
                    await Game.updateOne(
                        { _id: gameId },
                        { board: updatedBoard, turn: gameData.turn, result: 'draw' }
                    );
                    wss.clients.forEach((client) => {
                        const extendedClient = client as WebSocketExtended;
                        if (extendedClient.gameId === gameId) {
                            extendedClient.send(
                                JSON.stringify({
                                    type: 'game_over',
                                    draw: true,
                                })
                            );
                        }
                    });
                    delete games[gameId];
                } else {
                    await Game.updateOne(
                        { _id: gameId },
                        {
                            board: updatedBoard, turn: gameData.turn,
                            timers: {
                                player1: gameData.timers.player1,
                                player2: gameData.timers.player2,
                            }
                        }
                    );
                }

                stopTimer(gameId, currentTurn === gameData.player1 ? 'player1' : 'player2');
                startTimer(gameId, gameData.turn === gameData.player1 ? 'player1' : 'player2', wss);


                // Emit updated board state to both players
                wss.clients.forEach((client) => {
                    const extendedClient = client as WebSocketExtended;
                    if (extendedClient.gameId === gameId) {
                        extendedClient.send(
                            JSON.stringify({
                                type: 'board_update',
                                board: updatedBoard,
                                turn: gameData.turn,
                                timers: gameData.timers,
                            })
                        );
                    }
                });
            } catch (error) {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }));
            }
            break;

        case 'reconnect':
            const prevGameId = message.payload.gameId;
            const disconnectedUserEmail = message.payload.userEmail;

            // Check if game exists in the in-memory object
            let preGameData = games[prevGameId];

            // If not in memory, fetch from the database
            if (!preGameData) {
                try {
                    const dbGame = await Game.findById(prevGameId);
                    if (!dbGame) {
                        ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
                        return;
                    }

                    // Construct game data from database record
                    preGameData = {
                        game: new Chess(dbGame.board),
                        turn: dbGame.turn,
                        player1: dbGame.player1,
                        player2: dbGame.player2,
                        timers: {
                            player1: dbGame.timers ? dbGame.timers.player1 : 0,
                            player2: dbGame.timers ? dbGame.timers.player2 : 0,
                        },
                        timerIntervals: {
                            player1: null,
                            player2: null,
                        },
                        result: dbGame.result,
                    };

                    // Store in in-memory object for future use
                    games[prevGameId] = preGameData;
                } catch (error) {
                    console.error('Error fetching game from database:', error);
                    ws.send(JSON.stringify({ type: 'error', message: 'Error fetching game from database' }));
                    return;
                }
            }

            // Validate user participation in the game
            if (preGameData.player1 !== disconnectedUserEmail && preGameData.player2 !== disconnectedUserEmail) {
                ws.send(JSON.stringify({ type: 'error', message: 'User not part of this game' }));
                return;
            }

            // Update WebSocket with game details
            ws.gameId = prevGameId;
            ws.userEmail = disconnectedUserEmail;

            // Send current game state to the user
            ws.send(
                JSON.stringify({
                    type: 'board_update',
                    board: preGameData.game.fen(),
                    turn: preGameData.turn,
                    color: preGameData.player1 === disconnectedUserEmail ? 'white' : 'black',
                    timers: preGameData.timers,
                    result: preGameData.result,
                })
            );

            break;


        case 'promotion':
            const { from: fromP, to: toP, promotion, gameId: promotionGameId } = message.payload;
            const promotionGameData = games[promotionGameId];

            if (!promotionGameData) {
                console.log('Game not found');
                ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
                return;
            }

            const promotionGame = new Chess(promotionGameData.game.fen());
            const promotionTurn = promotionGameData.turn;

            if (promotionTurn !== userEmail) {
                ws.send(JSON.stringify({ type: 'error', message: 'Not your turn' }));
                return;
            }

            const move = promotionGame.move({ from: fromP, to: toP, promotion });

            if (!move) {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }));
                return;
            }

            const updatedPromotionBoard = promotionGame.fen();
            promotionGameData.game.load(updatedPromotionBoard); // Update the game state
            promotionGameData.turn = promotionGame.turn() === 'w' ? promotionGameData.player1 : promotionGameData.player2;

            await Game.updateOne(
                { _id: promotionGameId },
                { board: updatedPromotionBoard, turn: promotionGameData.turn }
            );

            wss.clients.forEach((client) => {
                const extendedClient = client as WebSocketExtended;
                if (extendedClient.gameId === promotionGameId) {
                    extendedClient.send(
                        JSON.stringify({
                            type: 'board_update',
                            board: updatedPromotionBoard,
                            turn: promotionGameData.turn,
                        })
                    );
                }
            });

            break;

        default:
            console.log('Unknown message type', message.type);
    }
};

// Function to start a player's timer
const startTimer = (gameId: string, player: 'player1' | 'player2', wss: WebSocket.Server) => {
    const gameData = games[gameId];
    if (!gameData) return;

    const playerEmail = player === 'player1' ? gameData.player1 : gameData.player2;
    const interval = setInterval(async () => {
        gameData.timers[player] -= 1000;
        if (gameData.timers[player] <= 0) {
            clearInterval(interval);
            // Declare the opponent as the winner
            const winner = player === 'player1' ? gameData.player2 : gameData.player1;
            gameData.result = winner;

            await Game.updateOne(
                { _id: gameId },
                {
                    result: winner,
                    timers: {
                        player1: gameData.timers.player1,
                        player2: gameData.timers.player2,
                    }
                }
            );

            wss.clients.forEach((client) => {
                const extendedClient = client as WebSocketExtended;
                if (extendedClient.gameId === gameId) {
                    extendedClient.send(
                        JSON.stringify({
                            type: 'game_over',
                            winner,
                            draw: false,
                        })
                    );
                }
            });

            delete games[gameId];
        } else {
            // Send timer update to the clients
            wss.clients.forEach((client) => {
                const extendedClient = client as WebSocketExtended;
                if (extendedClient.gameId === gameId) {
                    extendedClient.send(
                        JSON.stringify({
                            type: 'timer_update',
                            timers: gameData.timers,
                        })
                    );
                }
            });
        }
    }, 1000);

    // Store the interval ID so we can clear it later
    gameData.timerIntervals[player] = interval;
};

// Function to stop a player's timer
const stopTimer = (gameId: string, player: 'player1' | 'player2') => {
    const gameData = games[gameId];
    if (!gameData || !gameData.timerIntervals[player]) return;

    clearInterval(gameData.timerIntervals[player]!);
    gameData.timerIntervals[player] = null;
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
            if (pendingUser === ws) {
                pendingUser = null;
            }
            console.log('Client disconnected');
            console.log('total clients', wss.clients.size);
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