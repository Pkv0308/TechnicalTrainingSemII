const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true }, // e.g., Full-time, Contract
  description: { type: String } // Optional field for later
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);