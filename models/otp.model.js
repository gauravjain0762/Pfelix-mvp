const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: String,
    otp: String,
    name: String,
    password: String,
    expiresAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Otp', otpSchema);