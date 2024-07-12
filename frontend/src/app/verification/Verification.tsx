'use client'
import React, { useContext, useEffect, useState, Suspense } from 'react'
import { AiFillCheckCircle, AiFillExclamationCircle } from 'react-icons/ai';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthContext } from '@/context/Auth/authContext';

const Verification = () => {

    const [verified, setVerified] = useState(false)
    const searchParams = useSearchParams();
    const token = searchParams.get('token')
    const authContext = useContext(AuthContext)
    if (!authContext) {
        throw new Error('AuthContext is not defined')
    }
    const { user } = authContext
    const router = useRouter()

    useEffect(() => {
        if (token) {
            localStorage.setItem('accessToken', token)
        } else {
            router.push('/sign-in')
        }
    }, [token, router])

    useEffect(() => {
        if (user) {
            setVerified(true)
            router.push('/game')
        }
    }, [user, router])

    return (
        <Suspense fallback={<div>Loading...</div>}>
            {verified ? (
                <div className={`h-screen font-roboto font-poppins text-center flex flex-col items-center justify-center space-y-4 -mt-24`}>
                    <AiFillCheckCircle className='text-green-500 text-9xl' />
                    <h1 className='text-black text-4xl md:text-5xl font-bold md:pb-4 lg:pb-0 xl:pb-4 lg:py-2'>Email verified successfully</h1>
                </div>
            ) : (
                <div className={`h-screen font-roboto text-center flex flex-col items-center justify-center space-y-4 -mt-24`}>
                    <AiFillExclamationCircle className='text-orange-400 text-9xl' />
                    <h1 className='text-black text-4xl md:text-5xl font-bold md:pb-4 lg:pb-0 xl:pb-4 lg:py-2'>Email verifying...</h1>
                </div>
            )}
        </Suspense>
    )
}

export default Verification
