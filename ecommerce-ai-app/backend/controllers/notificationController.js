const Notification = require('../models/notificationModel');

// Get user notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
  }
};

// Create notification (internal use)
const createNotification = async (userId, data) => {
  try {
    const notification = new Notification({
      user: userId,
      ...data
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error in createNotification:', error);
    throw error;
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification
}; 