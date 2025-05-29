const User = require("../models/userModel");
const Order = require("../models/orderModel");
const SavedItem = require("../models/savedItemModel");
const Product = require("../models/productModel");

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total orders
    const totalOrders = await Order.countDocuments({ user: userId });

    // Get total spent
    const orders = await Order.find({ user: userId, status: 'completed' });
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Get wishlist count
    const wishlistCount = await SavedItem.countDocuments({ user: userId });

    // Get active orders
    const activeOrders = await Order.countDocuments({
      user: userId,
      status: { $in: ['processing', 'shipped', 'delivered'] }
    });

    res.json({
      totalOrders: totalOrders || 0,
      totalSpent: totalSpent || 0,
      wishlistCount: wishlistCount || 0,
      activeOrders: activeOrders || 0
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    // Return default values if there's an error
    res.json({
      totalOrders: 0,
      totalSpent: 0,
      wishlistCount: 0,
      activeOrders: 0
    });
  }
};

// Get admin statistics
const getAdminStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue[0] ? totalRevenue[0].totalRevenue : 0
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUserStats,
  getAdminStats
}; 