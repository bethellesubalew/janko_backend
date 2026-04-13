const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  password: String,
  status: {
    type: String,
    default: "available"
  }
});

module.exports = mongoose.model("Rider", riderSchema);