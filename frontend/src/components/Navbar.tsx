import { navData } from '@/utils/constants';
import Link from 'next/link';
import React from 'react';
import { BsHouse, BsPeopleFill } from 'react-icons/bs';
import { IoGameController } from 'react-icons/io5';
import { SiChessdotcom } from 'react-icons/si';

const NavIcon = ({ type }: { type: String }) => {
    return (
        <div className='flex items-center space-x-3 font-firaCode bg-[rgba(255,255,255,0.2)] py-1 px-3 mx-3 rounded-lg'>
            {
                type === 'Home' ? <BsHouse /> :
                    type === 'Play' ? <IoGameController /> :
                        type === 'Watch' ? <BsPeopleFill /> : ''
            }
            <span className='font-bold text-xl'>{type}</span>
        </div>
    );
};

const Navbar = () => {
    return (
        <nav className='fixed top-0 left-0 h-full p-2 px-0 bg-black flex flex-col items-center w-min font-firaCode'>
            <div className="top h-[10%] py-2 flex items-center justify-start space-x-1">
                <SiChessdotcom className='text-5xl text-[#acd06f]' />
                <span className='font-bold text-2xl'>Chess</span>
            </div>
            <div className="center h-[70%] pt-8">
                <ul className='flex flex-col space-y-3'>
                    {navData.map((item, index) => (
                        <li key={index}>
                            <Link className='text-3xl' href={item.href}>
                                <NavIcon type={item.name} />
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bottom h-[20%] flex items-end pb-8">
                <button className='p-2 px-4 text-black font-bold rounded-lg bg-[#acd06f] hover:-translate-y-1 transition-all duration-300'>
                    Sign In
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
