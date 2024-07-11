import StartGame from "./StartGame"

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Play | Chess Game",
    description: "Welcome to our real-time chess game",
};

const page = () => {

    return (
        <StartGame />
    )
}

export default page
