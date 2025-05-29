const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authmiddleware');
const chatController = require('../controllers/chatController');

// Define routes
router.get('/session', protect, chatController.getOrCreateChatSession);
router.post('/message', protect, chatController.sendMessage);
router.post('/close', protect, chatController.closeChatSession);

module.exports = router; 