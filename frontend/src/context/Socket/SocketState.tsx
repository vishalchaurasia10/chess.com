'use client'

import { SocketContext } from "./socketContext"
import React, { useState, ReactNode, useContext } from "react";
import { AuthContext } from "../Auth/authContext";
import toast, { Toaster } from "react-hot-toast";

interface SocketStateProps {
    children: ReactNode;
}

const SocketState: React.FC<SocketStateProps> = ({ children }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('AuthContext is not defined');
    }
    const { user } = context;

    const startGame = () => {
        if (!user) {
            toast.error('You must be logged in to play chess');
            return;
        }
        const ws = new WebSocket(process.env.NEXT_PUBLIC_SOCKET_URL || '');
        setSocket(ws);

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
            ws.send(JSON.stringify({ type: 'init_game', payload: { userEmail: user?.email } }));
        };
    }

    return (
        <SocketContext.Provider
            value={{
                socket,
                setSocket,
                startGame
            }}>
            <Toaster />
            {children}
        </SocketContext.Provider>
    );
};

export default SocketState;
