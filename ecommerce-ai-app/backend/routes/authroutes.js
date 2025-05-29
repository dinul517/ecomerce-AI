const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { protect } = require("../middleware/authmiddleware");
const User = require("../models/userModel"); // ✅ kalau mau return user

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;



