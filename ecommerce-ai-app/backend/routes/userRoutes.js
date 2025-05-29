const express = require("express");
const router = express.Router();
const { 
  getUserProfile, 
  updateUserProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/userController");
const { protect } = require("../middleware/authmiddleware");
const { isAdmin } = require("../middleware/isAdmin");

// Get user profile (protected route)
router.get("/profile", protect, getUserProfile);

// Update user profile (protected route)
router.put("/profile", protect, updateUserProfile);

// Admin routes
router.get("/", protect, isAdmin, getAllUsers);
router.get("/:id", protect, isAdmin, getUserById);
router.put("/:id", protect, isAdmin, updateUser);
router.delete("/:id", protect, isAdmin, deleteUser);

module.exports = router; 