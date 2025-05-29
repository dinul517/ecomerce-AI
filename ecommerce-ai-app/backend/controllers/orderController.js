const Order = require("../models/orderModel");
const { createNotification } = require('./notificationController');

// Get recent orders
const getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("items.product", "name price image");
    res.json(orders);
  } catch (error) {
    console.error("Error getting recent orders:", error);
    res.status(500).json({ message: "Error getting recent orders" });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name price image");
    res.json(orders);
  } catch (error) {
    console.error("Error getting user orders:", error);
    res.status(500).json({ message: "Error getting user orders" });
  }
};

// Create order
const createOrder = async (req, res) => {
  try {
    const order = new Order({
      user: req.user._id,
      items: req.body.items,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      totalAmount: req.body.totalAmount,
      notes: req.body.notes
    });

    await order.save();

    // Create notification for new order
    await createNotification(req.user._id, {
      title: 'Pesanan Baru',
      message: `Pesanan #${order._id.toString().slice(-6)} telah dibuat`,
      type: 'order',
      orderId: order._id,
      icon: 'local-shipping'
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price");
    res.json(orders);
  } catch (error) {
    console.error("Error getting all orders:", error);
    res.status(500).json({ message: "Error getting all orders" });
  }
};

// Get order by ID (admin)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name price");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error getting order:", error);
    res.status(500).json({ message: "Error getting order" });
  }
};

// Update order (admin)
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("user", "name email");
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Error updating order" });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, user: req.user._id },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create notification for status update
    let notificationTitle, notificationMessage, notificationIcon;

    switch (status) {
      case 'processing':
        notificationTitle = 'Pesanan Diproses';
        notificationMessage = `Pesanan #${order._id.toString().slice(-6)} sedang diproses`;
        notificationIcon = 'hourglass-empty';
        break;
      case 'shipped':
        notificationTitle = 'Pesanan Dikirim';
        notificationMessage = `Pesanan #${order._id.toString().slice(-6)} telah dikirim`;
        notificationIcon = 'local-shipping';
        break;
      case 'delivered':
        notificationTitle = 'Pesanan Diterima';
        notificationMessage = `Pesanan #${order._id.toString().slice(-6)} telah diterima`;
        notificationIcon = 'check-circle';
        break;
      case 'cancelled':
        notificationTitle = 'Pesanan Dibatalkan';
        notificationMessage = `Pesanan #${order._id.toString().slice(-6)} telah dibatalkan`;
        notificationIcon = 'cancel';
        break;
      default:
        notificationTitle = 'Status Pesanan Diperbarui';
        notificationMessage = `Status pesanan #${order._id.toString().slice(-6)} telah diperbarui`;
        notificationIcon = 'update';
    }

    await createNotification(req.user._id, {
      title: notificationTitle,
      message: notificationMessage,
      type: 'order',
      orderId: order._id,
      icon: notificationIcon
    });

    res.status(200).json(order);
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

module.exports = {
  getRecentOrders,
  getUserOrders,
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus
}; 