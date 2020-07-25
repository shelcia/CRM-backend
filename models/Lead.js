const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    min: 3,
    max: 255,
  },
  client: {
    type: String,
    required: true,
    min: 3,
    max: 255,
  },
  number: {
    type: Number,
    required: true,
    min: 3,
  },
  status: {
    type: String,
    required: true,
    max: 255,
    min: 2,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Lead", leadSchema);
