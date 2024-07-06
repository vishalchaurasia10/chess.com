import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import connectDB from './db/connection';
import authRoutes from './routes/authRoutes';
import setupWebSocket from './websocket';
dotenv.config();

const app = express();
const server = http.createServer(app);

// Database Connection
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// WebSocket setup
setupWebSocket(server);

// Start the server
server.listen(5000, () => {
    console.log('Server started on port 5000');
});