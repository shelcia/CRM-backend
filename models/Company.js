const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  company: {
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
  address: {
    type: String,
    max: 2048,
  },
  website: {
    type: String,
    max: 1028,
  },
  companySize: {
    type: Number,
  },
  logo: {
    type: Buffer,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Company", companySchema);
