const mongoose = require('mongoose');

const guildUserSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    totalCheckins: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    lastCheckin: { type: Date },
});

module.exports = mongoose.model('GuildUser', guildUserSchema);
