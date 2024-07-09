'use client'
import Link from 'next/link'
import React, { useContext, useEffect, useState } from 'react'
import { toast, Toaster } from 'react-hot-toast';
import { AuthContext } from '@/context/Auth/authContext';
import { useRouter } from 'next/navigation';

const StartGame = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('AuthContext is not defined');
    }
    const { user, setSocket } = context;
    const router = useRouter();

    const startGame = () => {
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
                toast.dismiss();
                router.push(`/game/gameId=${parsedData.gameId}`);
            } else if (type === 'waiting_for_opponent') {
                toast.loading('Waiting for opponent to join');
                console.log('Waiting for opponent to join');
            } else if (type === 'error') {
                toast.error(parsedData.message);
                console.error(parsedData.message);
            }
        };
    }

    return (
        <>
            <Toaster />
            <div className='py-20 font-firaCode flex items-center md:px-20 lg:px-20 xl:px-28 px-4 relative min-h-screen bg-center bg-cover text-black bg-[url("/chess.avif")]'>
                <div className="content relative z-20 space-y-4 md:space-y-8">
                    <h1 className='text-6xl md:text-8xl font-bold text-white'>Click on the Play Button</h1>
                    <h2 className='text-2xl md:text-5xl font-bold text-white'>To start the game.</h2>
                    <p className='text-white text-lg md:text-2xl'>
                        and wait for any player to join the game. The matching of opponents is random.
                    </p>
                    <div>
                        <Link href='/game'>
                            <button onClick={startGame} className="btn btn-active">Start a Match</button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default StartGame
