const mongoose = require('mongoose');

const ipoSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  symbol: { type: String, required: true },
  issueSize: { type: String, required: true },
  priceBand: { type: String, required: true },
  openDate: { type: Date, required: true },
  closeDate: { type: Date, required: true },
  gmp: { type: Number, required: true },
  qib: { type: Number, required: true },
  nii: { type: Number, required: true },
  retail: { type: Number, required: true },
  drhpUrl: { type: String, required: true },
  listingPrice: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ipo', ipoSchema);
