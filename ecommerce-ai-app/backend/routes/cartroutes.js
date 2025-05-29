// routes/cartroutes.js
const express = require("express");
const router = express.Router();
const { addToCart, getCart, updateCartItem, removeCartItem } = require("../controllers/cartController");
const { protect } = require("../middleware/authmiddleware");

// POST /api/cart → tambah ke cart
router.post("/", protect, addToCart);

// GET /api/cart → ambil isi cart
router.get("/", protect, getCart);

// PUT /api/cart → update item cart
router.put("/", protect, updateCartItem);

// DELETE /api/cart/:productId → hapus item cart
router.delete("/:productId", protect, removeCartItem);

module.exports = router;
