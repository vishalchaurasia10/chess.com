import { Metadata } from 'next';
import React, { Suspense } from 'react'
import Verification from './Verification';

export const metadata: Metadata = {
    title: "Verification | Chess Game",
    description: "Welcome to our real-time chess game",
};



const page = () => {
    return (
        <>
            <Suspense fallback={<div>Loading...</div>} >
                <Verification />
            </Suspense>
        </>
    )
}

export default page