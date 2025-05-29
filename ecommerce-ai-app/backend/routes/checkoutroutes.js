const express = require("express");
const router = express.Router();
const { checkout } = require("../controllers/checkoutController");
const { protect } = require("../middleware/authmiddleware");

// Tambahkan middleware autentikasi sebelum controller checkout
router.post("/", protect, checkout);

module.exports = router;
