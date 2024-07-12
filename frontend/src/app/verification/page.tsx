import { Metadata } from 'next';
import React from 'react'
import Verification from './Verification';

export const metadata: Metadata = {
    title: "Verification | Chess Game",
    description: "Welcome to our real-time chess game",
};



const page = () => {
    return (
        <>
            <Verification />
        </>
    )
}

export default page