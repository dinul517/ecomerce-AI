const express = require("express");
const router = express.Router();
const { 
  getRecentOrders, 
  getUserOrders, 
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder
} = require("../controllers/orderController");
const { protect } = require("../middleware/authmiddleware");
const { isAdmin } = require("../middleware/isAdmin");

// User routes
router.get("/recent", protect, getRecentOrders);
router.get("/my-orders", protect, getUserOrders);
router.post("/", protect, createOrder);

// Admin routes
router.get("/", protect, isAdmin, getAllOrders);
router.get("/:id", protect, isAdmin, getOrderById);
router.put("/:id", protect, isAdmin, updateOrder);

module.exports = router; 