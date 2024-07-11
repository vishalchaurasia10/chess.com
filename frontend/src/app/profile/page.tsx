import React from 'react'
import Profile from './Profile'

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profile | Chess Game",
    description: "Welcome to our real-time chess game",
};

const page = () => {
    return (
        <div>
            <Profile />
        </div>
    )
}

export default page
