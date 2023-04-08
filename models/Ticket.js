const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    min: 3,
    max: 255,
  },
  desc: {
    type: String,
    min: 3,
  },
  client: {
    type: String,
    required: true,
    min: 3,
    max: 255,
  },
  status: {
    type: String,
    required: true,
    max: 255,
    min: 2,
  },
  priority: {
    type: String,
    required: true,
    max: 255,
    min: 2,
  },
  assignee: {
    type: Array,
  },
  history: {
    type: Array,
    max: 255,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Ticket", ticketSchema);
