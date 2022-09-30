const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mail: {
    type: String,
    max: 512,
  },
  number: {
    type: String,
    max: 255,
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
    type: String,
    max: 255,
  },
  criticalClient: {
    type: Boolean,
  },
  companySize: {
    type: Number,
  },
  jobTitle: {
    type: String,
  },
  status: {
    type: String,
    required: true,
    max: 255,
  },
  lastActivity: {
    type: Date,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Contact", contactSchema);
