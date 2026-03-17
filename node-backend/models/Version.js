const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  version: { type: String, required: true, unique: true }, // e.g., "2.2.1"
  changes: { type: [String], required: true }, // Array of bullet points
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Version', versionSchema);
