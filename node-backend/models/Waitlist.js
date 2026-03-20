const mongoose = require('mongoose');

const WaitlistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    subscribedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Waitlist', WaitlistSchema);
