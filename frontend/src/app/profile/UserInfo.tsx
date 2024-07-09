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
        <div className='mt-10 px-8'>
            {
                !user ? <ProfileSkeleton /> :
                    <>
                        <h2 title={user?.name} className='truncate'><span className='font-bold'>Name: </span>{user?.name}</h2>
                        <h2 title={user?.email} className='truncate'><span className='font-bold'>Email: </span>{user?.email}</h2>
                    </>
            }
        </div>
    )
}

const ProfileSkeleton = () => {
    return (
        <div className="flex flex-col gap-3">
            <div className="skeleton bg-gray-500 h-4 w-40"></div>
            <div className="skeleton bg-gray-500 h-4 w-48"></div>
        </div>
    )
}

export default UserInfo
