import React from 'react'
import Signup from './Signup'

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up | Chess Game",
    description: "Welcome to our real-time chess game",
};

const page = () => {
    return (
        <div className={`signInWrapper lg:min-h-screen flex flex-col lg:flex-row items-center justify-center font-poppins`}>
            <div className="image flex items-center justify-center relative min-h-screen bg-center bg-cover lg:w-1/2 bg-[url('/chess.jpg')]">
                <div className='absolute h-full inset-0 bg-gradient-to-l from-transparent via-opacity-50 to-black' />
                <div className="message relative leading-tight md:leading-normal lg:leading-none font-extrabold px-4 md:px-20 lg:px-20 xl:px-32 pb-10 z-10 text-7xl md:text-8xl lg:text-7xl xl:text-8xl text-white">
                    Start playing chess.
                    <span className='block'>Sign Up Today!</span>
                </div>
            </div>
            <div className="form w-full lg:w-1/2">
                <Signup />
            </div>
        </div>
    )
}

export default page
