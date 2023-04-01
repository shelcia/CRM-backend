const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 1,
    max: 255,
  },
  email: {
    type: String,
    required: true,
    max: 255,
  },
  password: {
    type: String,
    required: true,
    max: 1024,
    min: 6,
  },
  role: {
    type: String,
    required: true,
    max: 30,
    min: 2,
  },
  token: {
    type: String,
    required: true,
  },
  permissions: {
    type: Array,
  },
  verified: {
    default: false,
    type: Boolean,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  company: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
