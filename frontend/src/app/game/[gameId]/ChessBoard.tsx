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
    const { game, onSquareClick, optionSquares, rightClickedSquares } = gameContext;

    useEffect(() => {
        if (!user) {
            toast.error('You must be logged in to play chess');
            router.push('/sign-in');
            return;
        }
    }, [user]);



    return (
        <div className='w-[90%] lg:w-[48%] shadow-2xl shadow-black'>
            <Toaster />
            <Chessboard
                position={game.fen()}
                arePiecesDraggable={false}
                onSquareClick={onSquareClick}
                customSquareStyles={{
                    ...optionSquares,
                    ...rightClickedSquares,
                }}
            />
        </div>
    );
};

export default ChessBoard;