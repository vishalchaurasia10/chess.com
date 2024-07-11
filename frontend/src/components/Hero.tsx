import Link from 'next/link';
import React from 'react';

const Hero = () => {
    return (
        <div className='pb-20 pt-5 lg:pt-0 lg:pb-0 font-firaCode flex items-center md:px-20 lg:px-20 xl:px-28 px-4 relative min-h-screen bg-center bg-cover text-black bg-[url("/chess.jpg")]'>
            <div className='absolute h-full inset-0 bg-gradient-to-l from-transparent via-opacity-50 to-black'></div>
            <div className="content relative z-20 space-y-4 md:space-y-8">
                <h1 className='text-6xl md:text-8xl font-extrabold md:font-bold text-white font-poppins'>Master the Art of Chess</h1>
                <h2 className='text-2xl md:text-5xl font-extrabold md:font-bold text-white font-poppins lg:font-firaCode'>Challenge Players Worldwide</h2>
                <p className='text-white text-lg md:text-2xl'>
                    Welcome to the ultimate chess battleground. Dive into intense matches with players from around the globe. Hone your skills, strategize your moves, and climb the leaderboards. Whether you&apos;re a beginner or a grandmaster, our platform offers a seamless and engaging experience for all levels. Join the community and become a part of the timeless game of chess.
                </p>
                <div>
                    <Link href='/game'>
                        <button className="btn btn-active">Start Playing</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Hero;