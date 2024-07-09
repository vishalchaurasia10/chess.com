import { Square } from "chess.js";
import React, { createContext } from "react";

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
    moveFrom: string | null;
    setMoveFrom: React.Dispatch<React.SetStateAction<Square | null>>;
    moveTo: string | null;
    setMoveTo: React.Dispatch<React.SetStateAction<Square | null>>;
    showPromotionDialog: boolean;
    setShowPromotionDialog: React.Dispatch<React.SetStateAction<boolean>>;
    rightClickedSquares: SquareStyles;
    setRightClickedSquares: React.Dispatch<React.SetStateAction<SquareStyles>>;
    optionSquares: SquareStyles;
    setOptionSquares: React.Dispatch<React.SetStateAction<SquareStyles>>;
    onSquareClick: (square: Square) => void;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);