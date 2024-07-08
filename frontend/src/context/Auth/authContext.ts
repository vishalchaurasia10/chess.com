import { createContext } from "react";

export interface Credentials {
    email: string;
    password: string;
}

export interface User {
    email: string;
}

export interface AuthContextType {
    user: null | User; // Adjust the type as needed
    setUser: React.Dispatch<React.SetStateAction<null | User>>;
    signup: (credentials: Credentials) => void;
    signin: (credentials: Credentials) => void; // Add signin function
    signout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
