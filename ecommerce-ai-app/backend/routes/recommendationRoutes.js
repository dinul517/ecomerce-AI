const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authmiddleware');
const { 
  trackInteraction,
  getRecommendations,
  updateProductSimilarities 
} = require('../controllers/recommendationController');

// Track user interaction with products
router.post('/track', protect, trackInteraction);

// Get personalized recommendations
router.get('/recommendations', protect, getRecommendations);

// Update product similarities (admin only)
router.post('/update-similarities', protect, updateProductSimilarities);

module.exports = router;
