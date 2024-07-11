import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
    player1: {
        type: String,
        required: true
    },
    player2: {
        type: String,
        required: true
    },
    board: {
        type: String,
        default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
    },
    turn: {
        type: String,
        required: true
    },
    result: {
        type: String,
        default: 'ongoing'
    },
    timers: {
        player1: { type: Number, required: true },
        player2: { type: Number, required: true },
    },
}, {
    timestamps: true
})

const Game = mongoose.model('Game', gameSchema);

export default Game;