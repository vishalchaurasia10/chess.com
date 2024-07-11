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
    const { timers, checkSquare, gameStatus, threatened, winner, turn, orientation, gameRecover, gameId, game, onSquareClick, optionSquares, rightClickedSquares, onPromotionPieceSelect, showPromotionDialog, moveTo, onSquareRightClick } = gameContext;
    if (!socketContext) {
        throw new Error('SocketContext is not defined');
    }
    const { socket, setSocket } = socketContext;

    const formatTime = (milliseconds: number): string => {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000); // Ensure seconds is a number
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
            <div className='fixed w-full top-10 text-center text-white font-poppins font-bold'>
                <div className='lg:text-right lg:pr-2 text-4xl lg:text-3xl'>
                    {
                        turn == user?.email ? 'Your Turn' : 'Opponents Turn'
                    }
                </div>
                <div>
                    {
                        orientation === 'white' ?
                            <>
                                <Clock message='Your Time' time={formatTime(timers.player1)} />
                                <Clock message='Opponent&apos;s Time' time={formatTime(timers.player2)} />
                            </> :
                            <>
                                <Clock message='Your Time' time={formatTime(timers.player2)} />
                                <Clock message='Opponent&apos;s Time' time={formatTime(timers.player1)} />
                            </>
                    }
                </div>
            </div>
        </>
    );
};

const Clock: React.FC<{ time: string, message: string }> = ({ time, message }) => {
    return (
        <div>
            {`${message}: ${time}`}
        </div>
    );
}

export default ChessBoard;