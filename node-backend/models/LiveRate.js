const mongoose = require('mongoose');

const liveRateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  change: { type: String, required: true },
  changePercent: { type: String, required: true },
  isPositive: { type: Boolean, required: true },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LiveRate', liveRateSchema);
