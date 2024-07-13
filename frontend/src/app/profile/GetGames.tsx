'use client'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/context/Auth/authContext';
import Image from 'next/image';
import Skeleton from './Skeleton';
import Link from 'next/link';

interface Game {
    player1: string;
    player2: string;
    result: string;
    createdAt: string;
    _id: string;
}

interface GameProps {
    key: React.Key;
    game: Game;
}

const GetGames = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const authContext = useContext(AuthContext);
    if (!authContext) throw new Error('AuthContext is not found');
    const { user } = authContext;

    useEffect(() => {
        const getGames = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/get-games`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: user?.email,
                    }),
                });
                const data = await res.json();
                setGames(data);
                setLoading(false);
            } catch (err) {
                console.log(err);
            };
        }
        if (user) {
            getGames();
        }
    }, [user]);

    return (
        <div className='flex flex-col lg:flex-row lg:flex-wrap'>

            {
                loading ?
                    [1, 2, 3, 4, 5].map((n) => (
                        <Skeleton key={n} />
                    ))
                    :
                    games &&
                        games.length > 0 ?
                        games.map((game, index) => (
                            <Game key={index} game={game} />
                        ))
                        :
                        <div className='text-center p-10 text-2xl font-bold'>No games played yet</div>
            }
        </div>
    )
}

const Game: React.FC<GameProps> = ({ key, game }) => {
    const formatDate = (date: string) => {
        const d = new Date(date);
        return d.toDateString();
    }
    return (
        <Link key={key} href={`/game/${game._id}`} className='flex lg:w-[40%] space-x-4 bg-[rgba(255,255,255,0.1)] rounded-lg shadow-2xl m-2 lg:m-5 p-4 backdrop-blur-lg' >
            <div className="image w-1/4">
                <Image className='h-full lg:h-24 w-28 object-cover rounded-lg' src="/dp.jpg" alt="dp" width={50} height={50} />
            </div>
            <div className="details w-3/4 truncate">
                <div title={formatDate(game.createdAt)}><span className='font-bold'>Played On: </span>{formatDate(game.createdAt)}</div>
                <div title={game.result}><span className='font-bold'>Winner: </span>{game.result}</div>
                <div title={game.player1}><span className='font-bold'>Player 1: </span>{game.player1}</div>
                <div title={game.player2}><span className='font-bold'>Player 2: </span>{game.player2}</div>
                <button className='hover:underline'>View Game</button>
            </div>
        </Link>
    );
};

export default GetGames
