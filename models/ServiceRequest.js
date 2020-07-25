const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema({
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
  manager: {
    type: String,
    required: true,
    min: 3,
    max: 255,
  },
  expected_revenue: {
    type: Number,
    required: true,
    min: 2,
  },
  probability: {
    type: Number,
    required: true,
    max: 255,
  },
  status: {
    type: String,
    required: true,
    max: 255,
    min: 2,
  },
  expected_closing: {
    type: Date,
    required: true,
  },
  priority: {
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

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
