const mongoose = require('mongoose');

// Schema for tracking user interactions with products
const userInteractionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  interactionType: {
    type: String,
    enum: ['view', 'add_to_cart', 'purchase', 'wishlist'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Schema for storing product similarities
const productSimilaritySchema = new mongoose.Schema({
  product1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  product2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  similarity: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
userInteractionSchema.index({ user: 1, timestamp: -1 });
userInteractionSchema.index({ product: 1, timestamp: -1 });
productSimilaritySchema.index({ product1: 1, product2: 1 }, { unique: true });

const UserInteraction = mongoose.model('UserInteraction', userInteractionSchema);
const ProductSimilarity = mongoose.model('ProductSimilarity', productSimilaritySchema);

module.exports = {
  UserInteraction,
  ProductSimilarity
}; 