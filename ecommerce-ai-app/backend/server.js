require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authroutes");
const productRoutes = require("./routes/productroutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const checkoutRoutes = require("./routes/checkoutroutes");
const cartRoutes =require("./routes/cartroutes");
const statsRoutes = require("./routes/statsRoutes");
const userRoutes = require("./routes/userRoutes");
const savedItemRoutes = require("./routes/savedItemRoutes");
const orderRoutes = require("./routes/orderRoutes");
const chatRoutes = require('./routes/chatRoutes');
const promoRoutes = require('./routes/promoRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route test
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// Import routes and use them
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/saved-items", savedItemRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/chat', chatRoutes);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// Global error handler (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;


