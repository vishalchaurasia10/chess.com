import WebSocket from 'ws';
import http from 'http';
import { Chess } from 'chess.js'; // Import chess.js library

interface WebSocketExtended extends WebSocket {
    isAlive: boolean;
}

// Message Types
type MessageType = 'init_game' | 'move';

interface Message {
    type: MessageType;
    payload: any;
}

// Function to handle different message types
const handleMessage = (message: Message, ws: WebSocketExtended, wss: WebSocket.Server, game: Chess) => {
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
            } else {
                console.log('Invalid move:', message.payload);
                // Handle invalid move
            }
            break;
        default:
            console.log('Unknown message type');
    }
};

// WebSocket setup function
const setupWebSocket = (server: http.Server) => {
    const wss = new WebSocket.Server({ server });
    const game = new Chess(); // Initialize chess.js game instance

    wss.on('connection', (ws: WebSocketExtended) => {
        ws.isAlive = true;

        ws.on('pong', () => {
            ws.isAlive = true;
        });

        ws.on('message', (data) => {
            try {
                const message: Message = JSON.parse(data.toString());
                handleMessage(message, ws, wss, game); // Pass game instance to handleMessage
            } catch (error) {
                console.error('Invalid message format', error);
            }
        });

        ws.send(JSON.stringify({ type: 'welcome', payload: 'Hello! Message From Server!!' }));
    });

    // Heartbeat to check if connection is alive
    setInterval(() => {
        wss.clients.forEach((ws: WebSocket) => {
            const wsExtended = ws as WebSocketExtended;
            if (!wsExtended.isAlive) return wsExtended.terminate();

            wsExtended.isAlive = false;
            wsExtended.ping(null, false, (err: Error) => {
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
