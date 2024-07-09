'use client'

import Link from 'next/link';
import { BsPlus, BsGearFill, BsPeopleFill, BsFillPersonFill, BsBoxArrowRight } from 'react-icons/bs';
import { SiChessdotcom } from 'react-icons/si';
import { AuthContext } from '@/context/Auth/authContext';
import { useContext } from 'react';

const SideBar = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    const { user, signout } = context;
    return (
        <div className="fixed z-50 top-0 left-0 h-screen w-16 flex flex-col bg-[rgba(255,255,255,0.2)] shadow-lg">
            <SideBarIcon icon={<SiChessdotcom size="28" />} text='Chess.com' toUrl='/' />
            <Divider />
            <SideBarIcon icon={<BsPlus size="32" />} text='Play new game ♟️' toUrl='/game' />
            <SideBarIcon icon={<BsPeopleFill size="20" />} text='Watch other games 👀' toUrl='/watch' />
            <Divider />
            {
                user ?
                    <>
                        <SideBarIcon icon={<BsFillPersonFill size="22" />} text={`${user.name} 🧑‍🦱 with ${user.email}`} toUrl='/profile' />
                        <div onClick={signout}>
                            <SideBarIcon icon={<BsBoxArrowRight size="22" />} text='Sign Out ⚙️' toUrl='/settings' />
                        </div>
                    </>
                    :
                    <SideBarIcon icon={<BsGearFill size="22" />} text='Sign In ⚙️' toUrl='/sign-in' />
            }
        </div>
    );
};

type SideBarIconProps = {
    icon: React.ReactNode;
    text?: string;
    toUrl: string;
};

const SideBarIcon = ({ icon, text = 'tooltip 💡', toUrl = '/' }: SideBarIconProps) => (
    <Link href={toUrl}>
        <div className="sidebar-icon group">
            {icon}
            <span className="sidebar-tooltip group-hover:scale-100">
                {text}
            </span>
        </div>
    </Link>
);


const Divider = () => <hr className="sidebar-hr" />;

export default SideBar;