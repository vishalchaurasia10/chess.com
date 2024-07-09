import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import connectDB from './db/connection';
import authRoutes from './routes/authRoutes';
import gameRoutes from './routes/gameRoutes';
import setupWebSocket from './websocket';
import cors from 'cors';
dotenv.config();

const app = express();
const server = http.createServer(app);

// Database Connection
connectDB();

// Middleware
app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL, // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// WebSocket setup
setupWebSocket(server);

// Start the server
server.listen(5000, () => {
    console.log('Server started on port 5000');
});