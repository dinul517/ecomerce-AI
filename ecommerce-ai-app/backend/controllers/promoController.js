const Promo = require('../models/promoModel');
const User = require('../models/userModel');
const { createNotification } = require('./notificationController');

// Create new promo
const createPromo = async (req, res) => {
  try {
    const promo = new Promo({
      code: req.body.code,
      description: req.body.description,
      discount: req.body.discount,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      minPurchase: req.body.minPurchase,
      maxDiscount: req.body.maxDiscount
    });

    await promo.save();

    // Get all users
    const users = await User.find({});

    // Create notifications for all users
    const notificationPromises = users.map(user =>
      createNotification(user._id, {
        title: 'Promo Baru!',
        message: `Gunakan kode ${promo.code} untuk mendapatkan diskon ${promo.discount}%`,
        type: 'promo',
        icon: 'local-offer',
        link: 'PromoDetail'
      })
    );

    await Promise.all(notificationPromises);

    res.status(201).json(promo);
  } catch (error) {
    console.error('Error in createPromo:', error);
    res.status(500).json({ message: 'Error creating promo', error: error.message });
  }
};

// Get active promos
const getActivePromos = async (req, res) => {
  try {
    const now = new Date();
    const promos = await Promo.find({
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    res.status(200).json(promos);
  } catch (error) {
    console.error('Error in getActivePromos:', error);
    res.status(500).json({ message: 'Error fetching promos', error: error.message });
  }
};

// Apply promo code
const applyPromo = async (req, res) => {
  try {
    const { code } = req.body;
    const now = new Date();

    const promo = await Promo.findOne({
      code,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    if (!promo) {
      return res.status(404).json({ message: 'Invalid or expired promo code' });
    }

    // Create notification for successful promo application
    await createNotification(req.user._id, {
      title: 'Promo Berhasil Diterapkan',
      message: `Kode promo ${promo.code} telah diterapkan`,
      type: 'promo',
      icon: 'check-circle',
      link: 'Cart'
    });

    res.status(200).json(promo);
  } catch (error) {
    console.error('Error in applyPromo:', error);
    res.status(500).json({ message: 'Error applying promo', error: error.message });
  }
};

module.exports = {
  createPromo,
  getActivePromos,
  applyPromo
}; 