'use client'
import React, { useContext, useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { AuthContext } from '@/context/Auth/authContext';
import { toast, Toaster } from 'react-hot-toast';

interface ChessBoardProps {
    gameId: string;
}

const ChessBoard: React.FC = () => {
    const [game, setGame] = useState(new Chess());
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [turn, setTurn] = useState<string>('');
    const [gameId, setGameId] = useState<string>('');
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('AuthContext is not defined');
    }
    const { user } = context;

    useEffect(() => {
        if (!user) {
            toast.error('You must be logged in to play chess');
            return;
        }
        const ws = new WebSocket('ws://localhost:5000');
        setSocket(ws);

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
            ws.send(JSON.stringify({ type: 'init_game', payload: { userEmail: user?.email } }));
        };

        ws.onmessage = (message) => {
            const parsedData = JSON.parse(message.data);
            console.log('Received message:', parsedData);
            const { type } = parsedData;
            if (type === 'game_started') {
                setGameId(parsedData.gameId);
                // setGame(new Chess(parsedData.board));
            } else if (type === 'waiting_for_opponent') {
                toast('Waiting for opponent to join');
            } else if (type === 'board_update') {
                const { board, turn } = parsedData;
                game.load(board);
                setGame(new Chess(game.fen()));
                setTurn(turn);
            } else if (type === 'error') {
                toast.error(parsedData.message);
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        return () => {
            ws.close();
        };
    }, []);

    const makeMove = (sourceSquare: string, targetSquare: string) => {
        const newGame = new Chess(game.fen());
        const result = newGame.move({
            from: sourceSquare,
            to: targetSquare,
        });

        if (result && socket) {
            socket.send(
                JSON.stringify({
                    type: 'move',
                    payload: {
                        from: sourceSquare,
                        to: targetSquare,
                        gameId,
                        userEmail: user?.email, // Adjust as needed
                    },
                })
            );
            setGame(newGame);
            return true; // move was successful
        }
        return false; // move was not successful
    };

    return (
        <div>
            <Toaster />
            <Chessboard position={game.fen()} onPieceDrop={(sourceSquare, targetSquare) => makeMove(sourceSquare, targetSquare)} />
        </div>
    );
};

export default ChessBoard;