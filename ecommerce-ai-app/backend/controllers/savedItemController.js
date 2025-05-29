const SavedItem = require("../models/savedItemModel");
const Product = require("../models/productModel");

// Get user's saved items
const getSavedItems = async (req, res) => {
  try {
    const userId = req.user._id;
    const savedItems = await SavedItem.find({ user: userId })
      .populate('product')
      .sort({ savedAt: -1 });
    res.json(savedItems);
  } catch (error) {
    console.error('Error getting saved items:', error);
    res.status(500).json({ message: "Gagal mengambil wishlist" });
  }
};

// Add item to saved items
const addSavedItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Check if already saved
    const existingSavedItem = await SavedItem.findOne({ user: userId, product: productId });
    if (existingSavedItem) {
      return res.status(400).json({ message: "Produk sudah ada di wishlist" });
    }

    const savedItem = new SavedItem({
      user: userId,
      product: productId
    });

    await savedItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error adding saved item:', error);
    res.status(500).json({ message: "Gagal menambahkan ke wishlist" });
  }
};

// Remove item from saved items
const removeSavedItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const savedItem = await SavedItem.findOneAndDelete({ user: userId, product: productId });
    if (!savedItem) {
      return res.status(404).json({ message: "Item tidak ditemukan di wishlist" });
    }

    res.json({ message: "Item berhasil dihapus dari wishlist" });
  } catch (error) {
    console.error('Error removing saved item:', error);
    res.status(500).json({ message: "Gagal menghapus dari wishlist" });
  }
};

module.exports = {
  getSavedItems,
  addSavedItem,
  removeSavedItem
}; 