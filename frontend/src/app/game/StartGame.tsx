'use client'
import React, { useContext } from 'react'
import { SocketContext } from '@/context/Socket/socketContext'

const StartGame = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('SocketContext is not defined');
    }
    const { startGame } = context;

    return (
        <>
            <div className='py-20 font-firaCode flex items-center md:px-20 lg:px-20 xl:px-28 px-4 relative min-h-screen bg-center bg-cover text-black bg-[url("/chess.avif")]'>
                <div className="content relative z-20 space-y-4 md:space-y-8">
                    <h1 className='text-6xl md:text-8xl font-bold text-white'>Click on the Play Button</h1>
                    <h2 className='text-2xl md:text-5xl font-bold text-white'>To start the game.</h2>
                    <p className='text-white text-lg md:text-2xl'>
                        and wait for any player to join the game. The matching of opponents is random.
                    </p>
                    <div>
                        <button onClick={startGame} className="btn btn-active">Start a Match</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default StartGame
