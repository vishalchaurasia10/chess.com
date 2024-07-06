import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
    player1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    player2: {
        type: mongoose.Schema.Types.ObjectId,
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
})

const Game = mongoose.model('Game', gameSchema);

export default Game;