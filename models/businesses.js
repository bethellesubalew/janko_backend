const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    name: String,
    type: String, // restaurant or pharmacy
    email: { type: String, unique: true },
    phone: String,
    location: String,
    password: String
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);