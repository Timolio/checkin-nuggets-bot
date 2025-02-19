const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const rewardSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => {
            nanoid(6);
        },
        unique: true,
    },
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    reward: {
        _id: { type: String, required: true },
        type: { type: String, enum: ['streak', 'total'], required: true },
        threshold: { type: Number, required: true },
    },
    createdAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
    closedBy: { type: String },
});

module.exports = mongoose.model('Reward', rewardSchema);
