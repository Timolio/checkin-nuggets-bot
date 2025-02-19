const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const rewardSchema = new mongoose.Schema({
    _id: { type: String, default: () => nanoid(6), unique: true },
    type: { type: String, enum: ['streak', 'total'], required: true },
    threshold: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

const guildSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    adminRoles: [String],
    rewards: [rewardSchema],
});

module.exports = mongoose.model('Guild', guildSchema);
