const mongoose = require("mongoose");

const savedItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product"
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate saved items
savedItemSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("SavedItem", savedItemSchema); 