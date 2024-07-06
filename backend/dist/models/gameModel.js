"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const gameSchema = new mongoose_1.default.Schema({
    player1: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    player2: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    moves: {
        type: [String],
        default: []
    },
    result: {
        type: String,
        enum: ['player1', 'player2', 'draw', 'ongoing'],
        default: 'ongoing'
    }
});
const Game = mongoose_1.default.model('Game', gameSchema);
exports.default = Game;
