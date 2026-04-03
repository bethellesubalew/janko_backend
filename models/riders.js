const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    vehicle: String,
}, { timestamps: true });

module.exports = mongoose.model('Rider', riderSchema);