const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productcontroller");
const { protect } = require("../middleware/authmiddleware");
const { isAdmin } = require("../middleware/isAdmin");

// Public routes
router.get("/", getProducts);
router.get("/:id", getProduct);

// Protected routes (admin only)
router.post("/", protect, isAdmin, createProduct);
router.put("/:id", protect, isAdmin, updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);

module.exports = router;

