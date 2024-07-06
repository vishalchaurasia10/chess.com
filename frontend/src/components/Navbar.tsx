import Link from 'next/link'
import React from 'react'

const Navbar = () => {
    return (
        <div className='flex space-x-4'>
            <Link href="/">Home</Link>
            <Link href="/game">Game</Link>
            <Link href="/sign-in">Login</Link>
            <Link href="/sign-up">sign-up</Link>
        </div>
    )
}

export default Navbar
