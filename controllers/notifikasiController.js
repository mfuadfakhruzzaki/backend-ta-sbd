const { Notifikasi, User } = require("../models");
const { ApiError } = require("../middleware/errorHandler");

// Get all notifications for a user
const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const notifications = await Notifikasi.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });

    // Get unread count
    const unreadCount = await Notifikasi.count({
      where: {
        user_id: userId,
        is_read: 0,
      },
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { notifikasiId } = req.params;

    // Find notification
    const notification = await Notifikasi.findByPk(notifikasiId);

    // Check if notification exists
    if (!notification) {
      throw new ApiError("Notification not found", 404);
    }

    // Check if notification belongs to user
    if (notification.user_id !== userId) {
      throw new ApiError("Unauthorized access to notification", 403);
    }

    // Update notification
    notification.is_read = 1;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Update all notifications
    const result = await Notifikasi.update(
      { is_read: 1 },
      {
        where: {
          user_id: userId,
          is_read: 0,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      count: result[0],
    });
  } catch (error) {
    next(error);
  }
};

// Delete a notification
const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { notifikasiId } = req.params;

    // Find notification
    const notification = await Notifikasi.findByPk(notifikasiId);

    // Check if notification exists
    if (!notification) {
      throw new ApiError("Notification not found", 404);
    }

    // Check if notification belongs to user
    if (notification.user_id !== userId) {
      throw new ApiError("Unauthorized access to notification", 403);
    }

    // Delete notification
    await notification.destroy();

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Create a notification (admin or system use)
const createNotification = async (req, res, next) => {
  try {
    // Verify admin status
    if (!req.user || req.user.role !== "admin") {
      throw new ApiError("Only admin can create notifications", 403);
    }

    const { user_id, judul, pesan, jenis } = req.body;

    // Check if user exists
    const userExists = await User.findByPk(user_id);
    if (!userExists) {
      throw new ApiError("User not found", 404);
    }

    // Create notification
    const newNotification = await Notifikasi.create({
      user_id,
      judul,
      pesan,
      jenis,
      is_read: 0,
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: newNotification,
    });
  } catch (error) {
    next(error);
  }
};

// Delete all notifications
const deleteAllNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Delete all notifications for the user
    const result = await Notifikasi.destroy({
      where: { user_id: userId },
    });

    res.status(200).json({
      success: true,
      message: "All notifications deleted successfully",
      count: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
  deleteAllNotifications,
};
