'use client'

import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/context/Auth/authContext'
import { useRouter } from 'next/navigation'
import { FcGoogle } from 'react-icons/fc'
import Link from 'next/link'

const Signup = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '', name: '' })
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('AuthContext must be used within an AuthProvider');
    }

    const { signup, user, googleAuth } = context;
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    }

    const handleSignup = async () => {
        signup(credentials)
    }

    useEffect(() => {
        if (user) {
            router.push('/game')
        }
    }, [user])

    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        }, 1000);

        // Clean up the timeout if the component unmounts
        return () => clearTimeout(timer);
    }, []);


    return (
        <div className='flex pb-28 lg:pb-0 px-8 md:px-40 lg:px-0 py-10 md:py-16 lg:pt-12 lg:py-0 flex-col items-center justify-center space-y-4 lg:space-y-3 xl:space-y-4'>
            <h1 className='text-4xl md:text-5xl font-bold md:pb-4 lg:pb-0 xl:pb-4 lg:py-2 whitespace-nowrap'>Create an account</h1>
            <button onClick={googleAuth} className='btn btn-outline w-full lg:w-1/2 border-2 rounded-xl'>
                <span className='text-2xl pb-1'>
                    <FcGoogle />
                </span>
                <span className='font-medium'>Continue with Google</span>
            </button>
            <Divider />
            <div className="inputs w-full lg:w-1/2 pb-6 lg:pb-0 xl:pb-6 flex flex-col items-center space-y-2">
                <input
                    onChange={handleChange}
                    value={credentials.name}
                    className='border-2 w-full outline-none bg-[#fafafa] border-[#c6c6c6] p-3 px-4 mx-4 rounded-xl'
                    placeholder='Enter the name'
                    type='text' name='name'
                    id='name'
                    required
                />
                <input
                    onChange={handleChange}
                    value={credentials.email}
                    className='border-2 w-full outline-none bg-[#fafafa] border-[#c6c6c6] p-3 px-4 mx-4 rounded-xl'
                    placeholder='Enter the email'
                    type='email' name='email'
                    id='email'
                    required
                />
                <input
                    onChange={handleChange}
                    value={credentials.password}
                    className='border-2 w-full outline-none bg-[#fafafa] border-[#c6c6c6] p-3 px-4 mx-4 rounded-xl'
                    placeholder='Enter the password'
                    type='password' name='password'
                    id='password'
                    required
                />
            </div>
            <button onClick={handleSignup} className='btn btn-active btn-neutral bg-black text-white w-full lg:w-1/2 rounded-xl'>
                <span>Create account</span>
            </button>
            <div className="alreadyText">
                Already have an account? <span className='font-bold'>
                    <Link href='/sign-in'>
                        Login
                    </Link>
                </span>
            </div>
        </div>
    )
}

const Divider = () => {
    return (
        <div className="or w-full lg:w-1/2 py-4 lg:py-0 xl:py-4 flex items-center space-x-4">
            <div className='w-full h-[0.075rem] bg-gray-300' />
            <div className='text-xl pb-1'>or</div>
            <div className='w-full h-[0.075rem] bg-gray-300' />
        </div>
    )
}

export default Signup
