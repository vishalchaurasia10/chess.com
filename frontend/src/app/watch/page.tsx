import React from 'react'

import { Metadata } from "next";
import Link from 'next/link';

export const metadata: Metadata = {
    title: "Watch Games | Chess Game",
    description: "Welcome to our real-time chess game",
};

const page = () => {
    return (
        <div className='pb-20 pt-5 lg:pt-0 lg:pb-0 font-firaCode flex items-center md:px-20 lg:px-20 xl:px-28 px-4 relative min-h-screen bg-center bg-cover text-black bg-[url("/chess.jpg")]'>
            <div className='absolute h-full inset-0 bg-gradient-to-r md:bg-gradient-to-l from-transparent via-opacity-50 to-black'></div>
            <div className="content relative z-20 space-y-4 md:space-y-8">
                <h1 className='text-6xl md:text-8xl font-extrabold md:font-bold text-white font-poppins'>Watch other player&apos;s game</h1>
                <h2 className='text-2xl md:text-5xl font-extrabold md:font-bold text-white font-poppins md:font-firaCode'>Feature Coming soon!</h2>
                <p className='text-white text-lg md:text-2xl'>
                    Meanwhile you can start a match with your friend or visit my portfolio.
                </p>
                <div>
                    <Link href='https://www.vishalchaurasia.tech/'>
                        <button className="btn btn-active">Visit Portfolio</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default page
