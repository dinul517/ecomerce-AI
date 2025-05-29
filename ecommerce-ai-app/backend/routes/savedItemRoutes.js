const express = require("express");
const router = express.Router();
const { getSavedItems, addSavedItem, removeSavedItem } = require("../controllers/savedItemController");
const { protect } = require("../middleware/authmiddleware");

// Get user's saved items
router.get("/", protect, getSavedItems);

// Add item to saved items
router.post("/", protect, addSavedItem);

// Remove item from saved items
router.delete("/:productId", protect, removeSavedItem);

module.exports = router; 