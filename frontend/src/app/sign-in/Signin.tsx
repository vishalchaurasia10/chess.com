'use client'

import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/context/Auth/authContext'
import { useRouter } from 'next/navigation'

const Signin = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' })
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('AuthContext must be used within an AuthProvider');
    }

    const { signin, user } = context;
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    }

    const handleSignin = async () => {
        const res = await signin(credentials)
        if (res === 'success') {
            setCredentials({ email: '', password: '' })
            router.push('/get-started')
        }
    }

    useEffect(() => {
        if (user) {
            router.push('/game')
        }
    }, [user])


    return (
        <div>
            <input onChange={handleChange} value={credentials.email} name='email' type="email" />
            <input onChange={handleChange} value={credentials.password} name='password' type="password" />
            <button onClick={handleSignin} className=''>
                <span>Log in</span>
            </button>
        </div>
    )
}

export default Signin
