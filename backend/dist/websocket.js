"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const chess_js_1 = require("chess.js"); // Import chess.js library
// Function to handle different message types
const handleMessage = (message, ws, wss, game) => {
    switch (message.type) {
        case 'init_game':
            console.log('Initializing game');
            game.reset(); // Reset the chess game
            // Optionally, you can set up additional game initialization logic here
            break;
        case 'move':
            const { from, to } = message.payload;
            const moveResult = game.move({ from, to });
            if (moveResult) {
                console.log('Move made:', moveResult);
                // Handle move validation or additional logic here
            }
            else {
                console.log('Invalid move:', message.payload);
                // Handle invalid move
            }
            break;
        default:
            console.log('Unknown message type');
    }
};
// WebSocket setup function
const setupWebSocket = (server) => {
    const wss = new ws_1.default.Server({ server });
    const game = new chess_js_1.Chess(); // Initialize chess.js game instance
    wss.on('connection', (ws) => {
        ws.isAlive = true;
        ws.on('pong', () => {
            ws.isAlive = true;
        });
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                handleMessage(message, ws, wss, game); // Pass game instance to handleMessage
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
            wsExtended.ping(null, false, (err) => {
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
