const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    console.log("Getting user profile for:", req.user._id);
    
    const user = await User.findById(req.user._id).select('-password');
    console.log("Found user:", user);
    
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log("Sending user profile");
    res.json(user);
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ message: "Error getting user profile" });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Update basic info
    if (name) user.name = name;
    if (email) user.email = email;

    // Update password if provided
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Password saat ini tidak sesuai" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    
    const updatedUser = await User.findById(user._id).select("-password");
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: "Gagal mengupdate profil user" });
  }
};

// Get all users (admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({ message: "Error getting all users" });
  }
};

// Get user by ID (admin)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ message: "Error getting user" });
  }
};

// Update user (admin)
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};

// Delete user (admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
}; 