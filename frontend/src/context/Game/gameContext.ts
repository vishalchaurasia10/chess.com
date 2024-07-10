import { Square } from "chess.js";
import React, { createContext } from "react";
import { PromotionPieceOption } from "react-chessboard/dist/chessboard/types";

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
}

export const GameContext = createContext<GameContextType | undefined>(undefined);