'use client'
import React, { use, useContext, useEffect, useState } from 'react';
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
    const { checkSquare, gameStatus, threatened, winner, turn, orientation, gameRecover, gameId, game, onSquareClick, optionSquares, rightClickedSquares, onPromotionPieceSelect, showPromotionDialog, moveTo, onSquareRightClick } = gameContext;
    if (!socketContext) {
        throw new Error('SocketContext is not defined');
    }
    const { socket, setSocket } = socketContext;

    // const disconnectSocket = () => {
    //     if (socket) {
    //         socket.close();
    //     }
    // };

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
        <>
            <div className='w-[90%] lg:w-[48%] shadow-2xl shadow-black'>
                <Toaster />
                {/* <button onClick={disconnectSocket}>Disconnect Socket</button> */}
                <Chessboard
                    key={gameRecover === true ? 'recover' : 'new'}
                    position={game.fen()}
                    arePiecesDraggable={false}
                    onSquareClick={onSquareClick}
                    onSquareRightClick={onSquareRightClick}
                    customSquareStyles={{
                        ...optionSquares,
                        ...rightClickedSquares,
                        ...(checkSquare ? { [checkSquare]: { background: 'rgba(255, 0, 0, 0.5)' } } : {}),
                    }}
                    boardOrientation={orientation}
                />
            </div>
            <p className='fixed w-full top-10 text-center lg:text-right lg:pr-2 text-4xl lg:text-3xl text-white font-poppins font-bold'>
                {
                    turn == user?.email ? 'Your Turn' : 'Opponents Turn'
                }
            </p>
        </>
    );
};

export default ChessBoard;