const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    timezone: { type: String },
    lastTimezoneChange: { type: Date },
});

module.exports = mongoose.model('User', userSchema);
