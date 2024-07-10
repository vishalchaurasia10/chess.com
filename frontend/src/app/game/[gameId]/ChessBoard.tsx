'use client'
import React, { useContext, useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { AuthContext } from '@/context/Auth/authContext';
import { SocketContext } from '@/context/Socket/socketContext';
import { GameContext } from '@/context/Game/gameContext';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';



const ChessBoard: React.FC = () => {

    const authcontext = useContext(AuthContext);
    const socketContext = useContext(SocketContext);
    const gameContext = useContext(GameContext);
    const router = useRouter();
    if (!authcontext) {
        throw new Error('AuthContext is not defined');
    }
    const { user } = authcontext;
    if (!gameContext) {
        throw new Error('GameContext is not defined');
    }
    const { gameRecover, gameId, game, onSquareClick, optionSquares, rightClickedSquares, onPromotionPieceSelect, showPromotionDialog, moveTo, onSquareRightClick } = gameContext;
    if (!socketContext) {
        throw new Error('SocketContext is not defined');
    }
    const { socket, setSocket } = socketContext;

    const disconnectSocket = () => {
        if (socket) {
            socket.close();
        }
    };

    useEffect(() => {
        const recoverGame = async () => {
            if (!gameId || !user?.email) {
                return;
            }
            const newSocket = new WebSocket('ws://localhost:5000')
            setSocket(newSocket);
            newSocket.onopen = () => {
                newSocket.send(
                    JSON.stringify({
                        type: 'reconnect',
                        payload: {
                            gameId,
                            userEmail: user?.email,
                        },
                    })
                );
            }
        }
        recoverGame();
    }, [gameId, user]);

    return (
        <div className='w-[90%] lg:w-[48%] shadow-2xl shadow-black'>
            <Toaster />
            {/* <button onClick={disconnectSocket}>Disconnect Socket</button> */}
            <Chessboard
                key={gameRecover === true ? 'recover' : 'new'}
                position={game.fen()}
                arePiecesDraggable={false}
                // onPromotionPieceSelect={onPromotionPieceSelect}
                // promotionToSquare={moveTo}
                // showPromotionDialog={showPromotionDialog}
                onSquareClick={onSquareClick}
                onSquareRightClick={onSquareRightClick}
                customSquareStyles={{
                    ...optionSquares,
                    ...rightClickedSquares,
                }}
            // orientation={game.turn() === 'w' ? 'white' : 'black'}
            />
        </div>
    );
};

export default ChessBoard;