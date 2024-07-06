"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = __importDefault(require("./db/connection"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const websocket_1 = __importDefault(require("./websocket"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Database Connection
(0, connection_1.default)();
// Middleware
app.use(express_1.default.json());
// Routes
app.use('/api/auth', authRoutes_1.default);
// WebSocket setup
(0, websocket_1.default)(server);
// Start the server
server.listen(5000, () => {
    console.log('Server started on port 5000');
});
