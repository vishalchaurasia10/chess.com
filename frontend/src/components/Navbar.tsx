import Link from 'next/link';
import { BsPlus, BsGearFill, BsPeopleFill } from 'react-icons/bs';
import { SiChessdotcom } from 'react-icons/si';

const SideBar = () => {
    return (
        <div className="fixed z-50 top-0 left-0 h-screen w-16 flex flex-col bg-[rgba(255,255,255,0.2)] shadow-lg">
            <SideBarIcon icon={<SiChessdotcom size="28" />} text='Chess.com' toUrl='/' />
            <Divider />
            <SideBarIcon icon={<BsPlus size="32" />} text='Play new game ♟️' toUrl='/game' />
            <SideBarIcon icon={<BsPeopleFill size="20" />} text='Watch other games 👀' toUrl='/watch' />
            <Divider />
            <SideBarIcon icon={<BsGearFill size="22" />} text='Sign In ⚙️' toUrl='/sign-in' />
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