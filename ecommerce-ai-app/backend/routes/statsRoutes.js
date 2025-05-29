const express = require("express");
const router = express.Router();
const { getUserStats, getAdminStats } = require("../controllers/statsController");
const { protect } = require("../middleware/authmiddleware");
const { isAdmin } = require("../middleware/isAdmin");
const Product = require("../models/productModel"); // Model Product
const Order = require("../models/orderModel"); // Updated import
const User = require("../models/userModel"); // Model User

// Get user statistics
router.get("/user", protect, getUserStats);

// Get admin statistics
// GET /api/stats/admin - statistik admin (dinamis)
router.get("/admin", protect, isAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments(); // Menghitung jumlah produk
    const totalOrders = await Order.countDocuments(); // Menghitung jumlah pesanan
    const totalUsers = await User.countDocuments(); // Menghitung jumlah pengguna
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } } // Menggunakan totalAmount
    ]); // Menghitung total pendapatan dari semua pesanan

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue[0] ? totalRevenue[0].totalRevenue : 0, // Memastikan totalRevenue ada
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
