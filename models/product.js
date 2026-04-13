const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },           // name of the product
  price: { type: Number, required: true },          // price in your currency
  category: { type: String, enum: ['food','medicine'], required: true }, // category
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // owner
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);