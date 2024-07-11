import React from 'react'
import ChessBoard from './ChessBoard'
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Game | Chess Game",
    description: "Welcome to our real-time chess game",
};

const page = () => {
    return (
        <div className="bg-[#424556] min-h-screen flex items-center justify-center relative lg:bg-center bg-cover text-black bg-[url('/chess.jpg')]">
            <div className='absolute h-full inset-0 bg-gradient-to-r md:bg-gradient-to-l from-transparent via-opacity-50 to-black'></div>
            <ChessBoard />
        </div>
    )
}

export default page
