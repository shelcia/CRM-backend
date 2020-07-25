const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: true,
    max: 1024,
    min: 2,
  },
  address: {
    type: String,
    required: true,
    max: 1025,
    min: 2,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Contacts", contactSchema);
