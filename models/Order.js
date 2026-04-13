 const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
    },

    // 🔥 NEW (IMPORTANT)
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
      },
    ],

    // 🔥 IMPROVED STATUS SYSTEM
    status: {
      type: String,
      enum: ["pending", "accepted", "picked", "delivered"],
      default: "pending",
    },

    totalPrice: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);