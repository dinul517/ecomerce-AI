const Product = require("../models/productModel");
const Cart = require("../models/cart");
const User = require("../models/userModel");

// Add to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Product out of stock" });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(item => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(updatedCart);
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Error adding to cart" });
  }
};

// Get cart
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    res.json(cart || { items: [] });
  } catch (error) {
    console.error("Error getting cart:", error);
    res.status(500).json({ message: "Error getting cart" });
  }
};

// Update cart item
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;
    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(updatedCart);
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Error updating cart" });
  }
};

// Remove cart item
const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    // Populate the items before sending response
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(updatedCart);
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Error removing from cart" });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem
};
