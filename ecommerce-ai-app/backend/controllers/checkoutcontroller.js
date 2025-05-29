const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Cart = require("../models/cart");

const shippingCosts = {
  regular: 15000,
  express: 30000,
  sameDay: 50000
};

const checkout = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingMethod } = req.body;

    // Validate shipping method
    if (!shippingCosts[shippingMethod]) {
      return res.status(400).json({ message: "Invalid shipping method" });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total amount
    const subtotal = cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    const shippingCost = shippingCosts[shippingMethod];
    const totalAmount = subtotal + shippingCost;

    // Create order
    const order = new Order({
      user: userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      })),
      subtotal,
      shippingCost,
      shippingMethod,
      totalAmount
    });

    // Update product stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: "Product out of stock" });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    // Save order and clear cart
    await order.save();
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).json({ message: "Error during checkout" });
  }
};

module.exports = {
  checkout
};
