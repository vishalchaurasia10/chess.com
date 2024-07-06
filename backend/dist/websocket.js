"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const chess_js_1 = require("chess.js"); // Import chess.js library
const gameModel_1 = __importDefault(require("./models/gameModel"));
let pendingUser = null;
const games = {};
// Function to handle different message types
const handleMessage = (message, ws, wss) => __awaiter(void 0, void 0, void 0, function* () {
    const { userEmail } = message.payload;
    switch (message.type) {
        case 'init_game':
            if (pendingUser) {
                const chess = new chess_js_1.Chess();
                const newGame = new gameModel_1.default({
                    player1: pendingUser.userEmail,
                    player2: userEmail,
                    turn: pendingUser.userEmail,
                });
                const savedGame = yield newGame.save();
                const gameId = savedGame._id.toString();
                games[gameId] = {
                    game: chess,
                    turn: pendingUser.userEmail,
                    player1: pendingUser.userEmail,
                    player2: userEmail,
                };
                pendingUser.gameId = gameId;
                ws.gameId = gameId;
                pendingUser.send(JSON.stringify({ type: 'game_started', gameId, board: chess.fen() }));
                ws.send(JSON.stringify({ type: 'game_started', gameId, board: chess.fen() }));
                pendingUser = null;
            }
            else {
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
                yield gameModel_1.default.updateOne({ _id: gameId }, { board: updatedBoard, turn: gameData.turn });
                // Emit updated board state to both players
                wss.clients.forEach((client) => {
                    const extendedClient = client;
                    if (extendedClient.gameId === gameId) {
                        extendedClient.send(JSON.stringify({
                            type: 'board_update',
                            board: updatedBoard,
                            turn: gameData.turn,
                        }));
                    }
                });
            }
            catch (error) {
                console.log('Invalid move:', message.payload);
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid move' }));
            }
            break;
        default:
            console.log('Unknown message type', message.type);
    }
});
// WebSocket setup function
const setupWebSocket = (server) => {
    const wss = new ws_1.default.Server({ server });
    wss.on('connection', (ws) => {
        ws.isAlive = true;
        ws.on('pong', () => {
            ws.isAlive = true;
        });
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                handleMessage(message, ws, wss);
            }
            catch (error) {
                console.error('Invalid message format', error);
            }
        });
        ws.send(JSON.stringify({ type: 'welcome', payload: 'Hello! Message From Server!!' }));
    });
    // Heartbeat to check if connection is alive
    setInterval(() => {
        wss.clients.forEach((ws) => {
            const wsExtended = ws;
            if (!wsExtended.isAlive)
                return wsExtended.terminate();
            wsExtended.isAlive = false;
            wsExtended.ping(undefined, false, (err) => {
                if (err) {
                    console.error('Ping error:', err);
                    wsExtended.terminate();
                }
            });
        });
    }, 30000);
    return wss;
};
exports.default = setupWebSocket;
