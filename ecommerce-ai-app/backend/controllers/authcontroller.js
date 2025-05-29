const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// REGISTER
const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    console.log("Register attempt for:", email);
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already registered:", email);
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    console.log("User registered successfully:", user._id);
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Register failed", error: err.message });
  }
};

// LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log("Login attempt for:", email);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid password for:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    console.log("User logged in successfully:", user._id);
    
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

module.exports = {
  register,
  login
};
