import React from 'react'
import GetGames from './GetGames'
import Image from 'next/image'
import UserInfo from './UserInfo'

const Profile = () => {
    return (
        <div className='min-h-screen relative p-2 lg:pl-32 w-full lg:flex bg-center bg-cover bg-[url("/chess.jpg")] bg-fixed text-white font-firaCode'>
            <div className='absolute h-full inset-0 bg-gradient-to-r from-transparent via-opacity-50 to-black'></div>
            <div className='lg:mt-28 py-20 rounded-lg shadow-2xl shadow-black flex flex-col justify-center items-center space-y-6 lg:w-1/4 lg:sticky lg:top-24 h-full bg-[rgba(255,255,255,0.1)] backdrop-blur-lg'>
                <div className="avatar">
                    <div className="ring-primary ring-offset-base-100 w-48 rounded-full ring ring-offset-2">
                        <Image src="/profile.webp" alt="dp" width={500} height={500} className='rounded-full' />
                    </div>
                </div>
                <div className="user w-full">
                    <UserInfo />
                </div>
            </div>
            <div className='lg:pl-10 lg:w-3/4'>
                <h1 className='text-4xl text-center lg:text-left py-8 lg:py-0 lg:text-6xl lg:m-4 font-extrabold'>Played Games</h1>
                <GetGames />
            </div>

        </div>
    )
}

export default Profile
