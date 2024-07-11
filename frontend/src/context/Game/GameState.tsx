'use client'

import { GameContext, SquareStyles } from "./gameContext"

import React, { useState, ReactNode, useContext, useEffect } from "react";

import { AuthContext } from "../Auth/authContext";
import { SocketContext } from "../Socket/socketContext";
import { Chess, Move, Square } from "chess.js";
import { toast, Toaster } from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import { BoardOrientation, PromotionPieceOption } from "react-chessboard/dist/chessboard/types";

interface GameStateProps {
    children: ReactNode;
}

const GameState: React.FC<GameStateProps> = ({ children }) => {
    const [game, setGame] = useState(new Chess());
    const [turn, setTurn] = useState<string>('');
    const [gameId, setGameId] = useState<string>('');
    const [moveFrom, setMoveFrom] = useState<Square | null>(null);
    const [moveTo, setMoveTo] = useState<Square | null>(null);
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [rightClickedSquares, setRightClickedSquares] = useState<SquareStyles>({});
    const [optionSquares, setOptionSquares] = useState<SquareStyles>({});
    const [gameRecover, setGameRecover] = useState(false);
    const [orientation, setOrientation] = useState<BoardOrientation>('white'); // ['white', 'black']
    const [threatened, setThreatened] = useState<string>('');
    const [gameStatus, setGameStatus] = useState<string>(''); // ['checkmate', 'stalemate', 'draw', 'ongoing']
    const [winner, setWinner] = useState<string>(''); // ['player1', 'player2', 'draw'
    const [checkSquare, setCheckSquare] = useState<Square | null>(null);
    const [timers, setTimers] = useState({ player1: 300000, player2: 300000 });
    const [gameover, setGameover] = useState(false);
    const [draw, setDraw] = useState(false);

    const authContext = useContext(AuthContext);
    const socketContext = useContext(SocketContext);
    const router = useRouter();
    const pathname = usePathname();
    if (!authContext) {
        throw new Error('AuthContext is not defined');
    }
    const { user } = authContext;

    if (!socketContext) {
        throw new Error('SocketContext is not defined');
    }
    const { socket, setSocket } = socketContext;

    const makeMove = (sourceSquare: string, targetSquare: string) => {
        if (turn !== user?.email) {
            toast.error('Not your turn');
            return false;
        }
        const newGame = new Chess(game.fen());
        const result = newGame.move({
            from: sourceSquare,
            to: targetSquare,
        });

        if (result && socket) {
            socket.send(
                JSON.stringify({
                    type: 'move',
                    payload: {
                        from: sourceSquare,
                        to: targetSquare,
                        gameId,
                        userEmail: user?.email, // Adjust as needed
                    },
                })
            );
            setGame(newGame);
            return true; // move was successful
        }
        return false; // move was not successful
    };

    function getMoveOptions(square: Square) {
        const moves = game.moves({
            square,
            verbose: true,
        });
        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        const newSquares: SquareStyles = {};
        moves.map((move) => {
            newSquares[move.to] = {
                background:
                    game.get(move.to) &&
                        game.get(move.to)?.color !== game.get(square)?.color
                        ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
                        : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
                borderRadius: "50%",
            };
            return move;
        });
        newSquares[square] = {
            background: "rgba(255, 255, 0, 0.4)",
        };
        setOptionSquares(newSquares);
        return true;
    }

    function onSquareClick(square: Square) {
        if (turn !== user?.email) {
            return;
        }
        setRightClickedSquares({});

        // from square
        if (!moveFrom) {
            const hasMoveOptions = getMoveOptions(square);
            if (hasMoveOptions) setMoveFrom(square);
            return;
        }

        // to square
        if (!moveTo) {
            // check if valid move before showing dialog
            const moves = game.moves({
                square: moveFrom,
                verbose: true,
            });
            const foundMove = moves.find(
                (m: Move) => m.from === moveFrom && m.to === square
            );
            // not a valid move
            if (!foundMove) {
                // check if clicked on new piece
                const hasMoveOptions = getMoveOptions(square);
                // if new piece, setMoveFrom, otherwise clear moveFrom
                setMoveFrom(hasMoveOptions ? square : null);
                return;
            }

            // valid move
            setMoveTo(square);

            // if promotion move
            if (
                (foundMove.color === "w" &&
                    foundMove.piece === "p" &&
                    square[1] === "8") ||
                (foundMove.color === "b" &&
                    foundMove.piece === "p" &&
                    square[1] === "1")
            ) {
                setShowPromotionDialog(true);
                return;
            }

            // make the move
            const move = makeMove(moveFrom, square);

            // if invalid, setMoveFrom and getMoveOptions
            if (!move) {
                const hasMoveOptions = getMoveOptions(square);
                if (hasMoveOptions) setMoveFrom(square);
                return;
            }

            setMoveFrom(null);
            setMoveTo(null);
            setOptionSquares({});
            setGameStatus('');
            setThreatened('');
            setWinner('');
            return;
        }
    }

    function onPromotionPieceSelect(piece?: PromotionPieceOption, promoteFromSquare?: Square, promoteToSquare?: Square): boolean {
        if (moveFrom)
            promoteFromSquare = promoteFromSquare || moveFrom;
        if (piece && promoteFromSquare && promoteToSquare && socket) {
            const gameCopy = new Chess(game.fen());
            const move = gameCopy.move({
                from: promoteFromSquare,
                to: promoteToSquare,
                promotion: piece.toLowerCase() ?? "q",
            });
            if (move) {
                setGame(gameCopy);
                socket.send(JSON.stringify({
                    type: 'promotion',
                    payload: {
                        from: moveFrom,
                        to: moveTo,
                        promotion: piece.toLowerCase(),
                        gameId,
                    },
                }));
            }
        }

        setMoveFrom(null);
        setMoveTo(null);
        setShowPromotionDialog(false);
        setOptionSquares({});
        return true;
    }


    function onSquareRightClick(square: Square) {
        const colour = "rgba(0, 0, 255, 0.4)";
        setRightClickedSquares((prev) => {
            const newSquares: SquareStyles = { ...prev };

            if (newSquares[square] && newSquares[square].background === colour) {
                delete newSquares[square];
            } else {
                newSquares[square] = { background: colour };
            }

            return newSquares;
        });
    }

    useEffect(() => {
        if (!socket) {
            return;
        }

        function getKingSquare(board: string, color: string): Square | null {
            const game = new Chess(board);
            const pieces = game.board();
            for (let row of pieces) {
                for (let piece of row) {
                    if (piece && piece.type === 'k' && piece.color === color) {
                        return piece.square as Square;
                    }
                }
            }
            return null;
        }


        const handleSocketMessage = (message: { data: string; }) => {
            const parsedData = JSON.parse(message.data);
            const { type } = parsedData;
            if (type === 'waiting_for_opponent') {
                toast.loading('Waiting for opponent to join');
            } else if (type === 'game_started') {
                toast.dismiss();
                setOrientation(parsedData.color);
                setTurn(parsedData.turn);
                setGameId(parsedData.gameId);
                setGame(new Chess(parsedData.board));
                router.push(`/game/${parsedData.gameId}`);
            } else if (type === 'board_update') {
                const { board, turn, color, result } = parsedData;
                if (!gameRecover) {
                    setGameRecover(true);
                }
                if (result === 'draw') {
                    setDraw(true);
                    socket.close();
                } else if (result && result !== 'ongoing') {
                    setWinner(result);
                    socket.close();
                }
                setTimers(parsedData.timers);
                game.load(board);
                if (color)
                    setOrientation(color);
                setGame(new Chess(game.fen()));
                setTurn(turn);
            } else if (type === 'promotion') {
                const { from, to, promotion } = parsedData.payload;
                const newGame = new Chess(game.fen());
                newGame.move({ from, to, promotion });
                setGame(newGame);
            } else if (type === 'timer_update') {
                setTimers(parsedData.timers);
            } else if (type === 'game_over') {
                setGameover(true);
                if (parsedData.draw) {
                    setDraw(true);
                } else {
                    setWinner(parsedData.winner);
                }
                socket.close();
            } else if (type === 'error') {
                toast.error(parsedData.message);
            }
        };

        const handleSocketClose = () => {
            setSocket(null);
            console.log('Disconnected from WebSocket server');
            if (gameId.length < 0 || gameover || winner.length > 0) return;
            setTimeout(() => {
                const newSocket = new WebSocket(process.env.NEXT_PUBLIC_SOCKET_URL || '');
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
            }, 1000);
        };

        socket.addEventListener('message', handleSocketMessage);
        socket.addEventListener('close', handleSocketClose);

        return () => {
            socket.removeEventListener('message', handleSocketMessage);
            socket.removeEventListener('close', handleSocketClose);
            socket.close();
        };
    }, [socket, gameId]);

    useEffect(() => {
        const id = pathname.split('/').pop() || '';
        if (id != 'game')
            setGameId(id);
    }, [socket]);

    return (
        <GameContext.Provider
            value={{
                game,
                setGame,
                turn,
                setTurn,
                gameId,
                setGameId,
                moveFrom,
                setMoveFrom,
                moveTo,
                setMoveTo,
                showPromotionDialog,
                setShowPromotionDialog,
                rightClickedSquares,
                setRightClickedSquares,
                optionSquares,
                setOptionSquares,
                onSquareClick,
                onPromotionPieceSelect,
                onSquareRightClick,
                gameRecover,
                orientation,
                gameStatus,
                threatened,
                winner,
                checkSquare,
                timers,
                draw
            }}>
            <Toaster />
            {children}
        </GameContext.Provider>
    );
}

export default GameState;