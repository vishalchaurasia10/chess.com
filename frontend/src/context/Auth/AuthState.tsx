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

        try {
            const res = await signinPromise;
            const data = await res.json();

            if (res.status !== 200) {
                toast.error(data.error || 'Signin failed. Please try again. 🤔');
                return 'error';
            }

            toast.success('Signin successful! 🎉');
            localStorage.setItem('accessToken', data.token);
            setUser({
                email: credentials.email
            });
            return 'success';
        } catch (error) {
            console.log(error);
            toast.error('Signin failed. Please try again. 🤔');
            return 'error';
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
            console.log(response);
            const data = await response.json();
            if (response.status === 200) {
                const email = data.email;
                setUser({
                    email
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    const signout = () => {
        setUser(null);
        localStorage.removeItem('accessToken');
        router.push('/sign-in');
    }

    useEffect(() => {
        verifyAccessToken();
    }, []);

    return (
        <>
            <Toaster />
            <AuthContext.Provider value={{ user, setUser, signup, signin, signout } as AuthContextType}>
                {children}
            </AuthContext.Provider>
        </>
    );
}

export default AuthState;
