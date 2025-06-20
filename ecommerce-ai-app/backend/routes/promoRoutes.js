const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authmiddleware');
const {
  createPromo,
  getActivePromos,
  applyPromo
} = require('../controllers/promoController');

// Admin routes
router.post('/', protect, admin, createPromo);

// Public routes
router.get('/active', getActivePromos);

// Protected routes
router.post('/apply', protect, applyPromo);

module.exports = router; 