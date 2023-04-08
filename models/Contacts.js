const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mail: {
    type: String,
  },
  number: {
    type: String,
  },
  company: {
    type: String,
    max: 255,
  },
  contactOwner: {
    type: String,
    max: 255,
  },
  assignee: {
    type: Array,
    max: 255,
  },
  priority: {
    type: String,
    max: 255,
  },
  companySize: {
    type: Number,
  },
  jobTitle: {
    type: String,
    max: 255,
  },
  expectedRevenue: {
    type: Number,
  },
  expectedClosing: {
    type: Date,
  },
  probability: {
    type: String,
    max: 255,
  },
  status: {
    type: String,
    required: true,
    max: 255,
  },
  lastActivity: {
    type: Date,
    default: Date.now(),
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Contact", contactSchema);
