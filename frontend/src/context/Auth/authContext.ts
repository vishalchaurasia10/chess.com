import { createContext } from "react";

export interface Credentials {
    email: string;
    password: string;
    name: string;
}

export interface User {
    email: string;
    name: string;
}

export interface AuthContextType {
    user: null | User; // Adjust the type as needed
    socket: WebSocket | null;
    setSocket: React.Dispatch<React.SetStateAction<WebSocket | null>>;
    setUser: React.Dispatch<React.SetStateAction<null | User>>;
    signup: (credentials: Credentials) => void;
    signin: (credentials: { email: string, password: string }) => void; // Add signin function
    signout: () => void;
    googleAuth: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
