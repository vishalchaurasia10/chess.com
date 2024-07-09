import { createContext } from "react";

export interface SocketContextType {
    socket: WebSocket | null;
    setSocket: React.Dispatch<React.SetStateAction<WebSocket | null>>;
    startGame: () => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);