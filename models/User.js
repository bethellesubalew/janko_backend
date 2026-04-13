 const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: String,
  password: String,
  role: {
    type: String,
    enum: ["customer", "rider", "admin"],
    default: "customer"
  }
});

module.exports = mongoose.model("User", userSchema);
