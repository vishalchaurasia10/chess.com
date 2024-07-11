'use client'
import React, { useContext, useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { AuthContext } from '@/context/Auth/authContext';
import { SocketContext } from '@/context/Socket/socketContext';
import { GameContext } from '@/context/Game/gameContext';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { BsExclamationCircleFill } from 'react-icons/bs';
import { themes } from '@/utils/constants';

const ChessBoard: React.FC = () => {

    const [selectedTheme, setSelectedTheme] = useState('fireAndIce');
    const authcontext = useContext(AuthContext);
    const socketContext = useContext(SocketContext);
    const gameContext = useContext(GameContext);
    const router = useRouter();
    if (!authcontext) {
        throw new Error('AuthContext is not defined');
    }
    const { user } = authcontext;
    if (!gameContext) {
        throw new Error('GameContext is not defined');
    }
    const { draw, timers, checkSquare, gameStatus, threatened, winner, turn, orientation, gameRecover, gameId, game, onSquareClick, optionSquares, rightClickedSquares, onPromotionPieceSelect, showPromotionDialog, moveTo, onSquareRightClick } = gameContext;
    if (!socketContext) {
        throw new Error('SocketContext is not defined');
    }
    const { socket, setSocket } = socketContext;

    const formatTime = (milliseconds: number): string => {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000); // Ensure seconds is a number
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    useEffect(() => {
        const recoverGame = async () => {
            if (!gameId || !user?.email) {
                return;
            }
            const newSocket = new WebSocket('ws://localhost:5000')
            setSocket(newSocket);
            newSocket.onopen = () => {
                newSocket.send(
                    JSON.stringify({
                        type: 'reconnect',
                        payload: {
                            gameId,
                            userEmail: user?.email,
                        },
                    })
                );
            }
        }
        recoverGame();
    }, [gameId, user]);

    useEffect(() => {
        const showModal = () => {
            const modal = document.getElementById('my_modal_2') as HTMLDialogElement;
            if (modal) {
                modal.showModal();
            }
        };

        if (winner || draw) {
            showModal();
        }
    }, [winner, draw]);

    const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTheme(event.target.value);
    };

    return (
        <>
            <div className='w-[90%] lg:w-[48%] shadow-2xl shadow-black'>
                <Toaster />
                <Chessboard
                    key={gameRecover === true ? 'recover' : 'new'}
                    position={game.fen()}
                    arePiecesDraggable={false}
                    onSquareClick={onSquareClick}
                    onSquareRightClick={onSquareRightClick}
                    customSquareStyles={{
                        ...optionSquares,
                        ...rightClickedSquares,
                        ...(checkSquare ? { [checkSquare]: { background: 'rgba(255, 0, 0, 0.5)' } } : {}),
                    }}
                    boardOrientation={orientation}
                    customBoardStyle={themes[selectedTheme].boardStyle}
                    customDarkSquareStyle={themes[selectedTheme].darkSquareStyle}
                    customLightSquareStyle={themes[selectedTheme].lightSquareStyle}
                />
            </div>
            <div className='fixed w-full top-10 lg:text-right lg:pr-2 text-center text-white font-poppins font-bold'>
                <div className="theme-selector text-black">
                    <label htmlFor="theme-select" className="text-white">Select Theme: </label>
                    <select id="theme-select" value={selectedTheme} onChange={handleThemeChange} className="ml-2 p-1 rounded">
                        <option value="fireAndIce">Fire and Ice</option>
                        <option value="inferno">Inferno</option>
                        <option value="nightSky">Night Sky</option>
                        <option value="mysticForest">Mystic Forest</option>
                        <option value="sunsetGlow">Sunset Glow</option>
                    </select>
                </div>
                <div className='text-4xl lg:text-3xl'>
                    {
                        turn == user?.email ? 'Your Turn' : 'Opponents Turn'
                    }
                </div>
                <div>
                    {
                        orientation === 'white' ?
                            <>
                                <Clock message='Your Time' time={formatTime(timers.player1)} />
                                <Clock message='Opponent&apos;s Time' time={formatTime(timers.player2)} />
                            </> :
                            <>
                                <Clock message='Your Time' time={formatTime(timers.player2)} />
                                <Clock message='Opponent&apos;s Time' time={formatTime(timers.player1)} />
                            </>
                    }
                </div>
            </div>
            {(winner && winner.length > 0) || draw ? (
                <dialog id="my_modal_2" className="modal">
                    <div className="modal-box font-poppins">
                        <div className='flex items-center space-x-2'>
                            <BsExclamationCircleFill size={22} className="text-orange-400" />
                            <h3 className="font-bold text-2xl">
                                Game Over
                            </h3>
                        </div>
                        <p className="py-4">
                            {draw ? 'Match Draw' : <>Player with email <strong>{winner}</strong> is the winner</>}
                        </p>

                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                    </form>
                </dialog>
            ) : null}
        </>
    );
};

const Clock: React.FC<{ time: string, message: string }> = ({ time, message }) => {
    return (
        <div>
            {`${message}: ${time}`}
        </div>
    );
}

export default ChessBoard;