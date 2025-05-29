const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['order', 'promo', 'system'],
    required: true
  },
  icon: {
    type: String,
    default: 'notifications'
  },
  read: {
    type: Boolean,
    default: false
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  link: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema); 