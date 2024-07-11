import { Square } from "chess.js";
import React, { createContext } from "react";
import { BoardOrientation, PromotionPieceOption } from "react-chessboard/dist/chessboard/types";

export interface SquareStyles {
    [key: string]: {
        background: string;
        borderRadius?: string;
    };
}

export interface GameContextType {
    game: any;
    setGame: React.Dispatch<React.SetStateAction<any>>;
    turn: string;
    setTurn: React.Dispatch<React.SetStateAction<string>>;
    gameId: string;
    setGameId: React.Dispatch<React.SetStateAction<string>>;
    moveFrom: Square | null;
    setMoveFrom: React.Dispatch<React.SetStateAction<Square | null>>;
    moveTo: Square | null;
    setMoveTo: React.Dispatch<React.SetStateAction<Square | null>>;
    showPromotionDialog: boolean;
    setShowPromotionDialog: React.Dispatch<React.SetStateAction<boolean>>;
    onPromotionPieceSelect: (piece?: PromotionPieceOption, promoteFromSquare?: Square, promoteToSquare?: Square) => boolean
    rightClickedSquares: SquareStyles;
    setRightClickedSquares: React.Dispatch<React.SetStateAction<SquareStyles>>;
    optionSquares: SquareStyles;
    setOptionSquares: React.Dispatch<React.SetStateAction<SquareStyles>>;
    onSquareClick: (square: Square) => void;
    onSquareRightClick: (square: Square) => void;
    gameRecover: boolean;
    orientation: BoardOrientation;
    gameStatus: string;
    threatened: String;
    winner: String;
    checkSquare: Square | null;
    timers: {
        player1: number;
        player2: number;
    };
    draw: boolean;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);