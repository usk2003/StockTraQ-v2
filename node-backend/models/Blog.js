const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true }, // Can store Markdown or HTML
  author: { type: String, required: true, trim: true },
  summary: { type: String, required: true, trim: true }, // For list view or SEO
  imageUrl: { type: String, default: '' }, // Optional banner image
  tags: { type: [String], default: [] }, // Array of strings for categories/tags
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
blogSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
