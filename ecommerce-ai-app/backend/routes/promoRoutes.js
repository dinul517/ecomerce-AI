const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authmiddleware');
const { isAdmin } = require('../middleware/isAdmin');
const {
  createPromo,
  getActivePromos,
  applyPromo
} = require('../controllers/promoController');

// Admin routes
router.post('/', protect, isAdmin, createPromo);

// Public routes
router.get('/active', getActivePromos);

// Protected routes
router.post('/apply', protect, applyPromo);

module.exports = router; 