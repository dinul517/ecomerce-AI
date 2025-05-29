const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.put('/:notificationId/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);

module.exports = router; 