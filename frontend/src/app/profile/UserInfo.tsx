'use client'

import React, { useContext } from 'react'
import { AuthContext } from '@/context/Auth/authContext'

const UserInfo = () => {
    const authContext = useContext(AuthContext);
    if (!authContext) {
        return null;
    }
    const { user } = authContext;
    return (
        <div>
            {/* <h1 className='text-4xl font-extrabold'>{user?.name}</h1> */}
            <h2 className=''><span className='font-bold'>Email: </span>{user?.email}</h2>
        </div>
    )
}

export default UserInfo
