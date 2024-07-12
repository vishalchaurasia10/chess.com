'use client'

import React, { useState, ReactNode, useEffect } from "react";
import { AuthContext, AuthContextType, Credentials, User } from "./authContext";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface AuthStateProps {
    children: ReactNode;
}

const AuthState: React.FC<AuthStateProps> = ({ children }) => {
    const [user, setUser] = useState<null | User>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const router = useRouter();

    const signup = async (credentials: Credentials) => {

        if (credentials.password.length < 8) {
            toast.error('Password must be at least 8 characters long. 🤔');
            return;
        } else if (credentials.name.length < 3) {
            toast.error('Name must be at least 3 characters long. 🤔');
            return;
        } else if (credentials.email.length < 3) {
            toast.error('Invalid email. 🤔');
            return;
        }

        toast.loading('Signing up...');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (res.status === 201) {
                toast.dismiss();
                toast.success('Signup successful!🎉. Now you can login');
                router.push('/sign-in');
            } else {
                const errorData = await res.json();
                toast.dismiss();
                toast.error(errorData.error || 'Signup failed. Please try again. 🤔')
            }
        } catch (error) {
            toast.dismiss();
            toast.error('Signup failed. Please try again. 🤔');
        }
    };

    const signin = async (credentials: { email: string, password: string }) => {

        if (credentials.password.length < 8) {
            toast.error('Password must be at least 8 characters long. 🤔');
            return;
        } else if (credentials.email.length < 3) {
            toast.error('Invalid email. 🤔');
            return;
        }

        toast.loading('Signing in...');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });
            const data = await res.json();
            toast.dismiss();

            if (res.status !== 200) {
                toast.error(data.error || 'Signin failed. Please try again. 🤔');
                return;
            }

            toast.success('Signin successful! 🎉');
            localStorage.setItem('accessToken', data.token);
            setUser({
                email: data.email,
                name: data.name
            });
        } catch (error) {
            toast.error('Signin failed. Please try again. 🤔');
        }
    }

    const verifyAccessToken = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verifyjwt`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            const data = await response.json();
            if (response.status === 200) {
                const email = data.email;
                const name = data.name;
                setUser({
                    email: email,
                    name: name
                });
            } else {
                router.push('/sign-in');
            }
        } catch (error) {
            router.push('/sign-in');
        }
    }

    const signout = () => {
        setUser(null);
        localStorage.removeItem('accessToken');
        router.push('/sign-in');
    }

    const googleAuth = () => {
        try {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
        } catch (error) {
            toast.error((error as Error).message);
        }
    }

    useEffect(() => {
        verifyAccessToken();
    }, []);

    return (
        <>
            <Toaster />
            <AuthContext.Provider
                value={{
                    user,
                    socket,
                    setSocket,
                    setUser,
                    signup,
                    signin,
                    signout,
                    googleAuth
                } as AuthContextType}>
                {children}
            </AuthContext.Provider>
        </>
    );
}

export default AuthState;
