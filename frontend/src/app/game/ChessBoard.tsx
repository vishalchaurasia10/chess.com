'use client'
import React, { useContext, useEffect, useState } from 'react';
import { Chess, Move, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { AuthContext } from '@/context/Auth/authContext';
import { toast, Toaster } from 'react-hot-toast';

interface SquareStyles {
    [key: string]: {
        background: string;
        borderRadius?: string;
    };
}

const ChessBoard: React.FC = () => {
    const [game, setGame] = useState(new Chess());
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [turn, setTurn] = useState<string>('');
    const [gameId, setGameId] = useState<string>('');

    const [moveFrom, setMoveFrom] = useState("");
    const [moveTo, setMoveTo] = useState<Square | null>(null);
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [rightClickedSquares, setRightClickedSquares] = useState<SquareStyles>({});
    const [optionSquares, setOptionSquares] = useState<SquareStyles>({});


    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('AuthContext is not defined');
    }
    const { user } = context;

    useEffect(() => {
        if (!user) {
            toast.error('You must be logged in to play chess');
            return;
        }
        const ws = new WebSocket('ws://localhost:5000');
        setSocket(ws);

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
            ws.send(JSON.stringify({ type: 'init_game', payload: { userEmail: user?.email } }));
        };

        ws.onmessage = (message) => {
            const parsedData = JSON.parse(message.data);
            console.log('Received message:', parsedData);
            const { type } = parsedData;
            if (type === 'game_started') {
                setGameId(parsedData.gameId);
                setTurn(parsedData.turn);
            } else if (type === 'waiting_for_opponent') {
                toast('Waiting for opponent to join');
            } else if (type === 'board_update') {
                const { board, turn } = parsedData;
                game.load(board);
                setGame(new Chess(game.fen()));
                setTurn(turn);
            } else if (type === 'error') {
                toast.error(parsedData.message);
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        return () => {
            ws.close();
        };
    }, []);

    const makeMove = (sourceSquare: string, targetSquare: string) => {
        if(turn !== user?.email) {
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
        if(turn !== user?.email) {
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
                setMoveFrom(hasMoveOptions ? square : "");
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

            setMoveFrom("");
            setMoveTo(null);
            setOptionSquares({});
            return;
        }
    }

    return (
        <div>
            <Toaster />
            <Chessboard
                position={game.fen()}
                arePiecesDraggable={false}
                onSquareClick={onSquareClick}
                onPieceDrop={(sourceSquare, targetSquare) => makeMove(sourceSquare, targetSquare)}
                customSquareStyles={{
                    ...optionSquares,
                    ...rightClickedSquares,
                }}
            />
        </div>
    );
};

export default ChessBoard;