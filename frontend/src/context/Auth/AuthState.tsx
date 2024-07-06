'use client'

import React, { useState, ReactNode } from "react";
import { AuthContext, AuthContextType, Credentials, User } from "./authContext";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface AuthStateProps {
    children: ReactNode;
}

const AuthState: React.FC<AuthStateProps> = ({ children }) => {
    const [user, setUser] = useState<null | User>(null);
    const router = useRouter();

    const signup = async (credentials: Credentials) => {
        const signupPromise = fetch(`${process.env.API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        toast.promise(
            signupPromise,
            {
                loading: 'Signing up...', // Changed pending to loading
                success: 'Signup successful! 🎉.Now you can login',
                error: 'Signup failed. Please try again. 🤔'
            }
        );

        try {
            const res = await signupPromise;
            if (res.status === 201) {
                router.push('/sign-in');
            }
            return 'error';
        } catch (error) {
            console.log(error);
        }
    }

    const signin = async (credentials: Credentials) => {
        const signinPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        toast.promise(
            signinPromise,
            {
                loading: 'Signing in...',
                success: 'Signin successful! 🎉',
                error: 'Signin failed. Please try again. 🤔'
            }
        );

        try {
            const res = await signinPromise;
            const data = await res.json();
            if (res.status === 200) {
                localStorage.setItem('token', data.token);
                setUser({
                    email: credentials.email
                })
                return 'success';
            }
            return 'error';
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <Toaster />
            <AuthContext.Provider value={{ user, setUser, signup, signin } as AuthContextType}>
                {children}
            </AuthContext.Provider>
        </>
    );
}

export default AuthState;
