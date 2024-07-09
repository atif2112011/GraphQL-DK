const mongoose = require('mongoose');

const verifySchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // 1 day in seconds
    },
    otp: {
        type: String,
    }
});

// Index for automatic expiration after 1 day
verifySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model("verify", verifySchema);
