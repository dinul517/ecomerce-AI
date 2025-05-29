const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSchema],
  context: {
    lastProductViewed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    currentCategory: String,
    userPreferences: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
chatSessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession; 