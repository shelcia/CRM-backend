const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  fName: {
    type: String,
    required: true,
    max: 255,
  },
  lName: {
    type: String,
    max: 255,
  },
  number: {
    type: String,
    max: 255,
  },
  cmail: {
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
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Contact", contactSchema);
