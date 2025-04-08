const express = require("express");
const router = express.Router();
const notifikasiController = require("../controllers/notifikasiController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");

// Protect all notification routes with authentication
router.use(authenticate);

// GET /api/notifikasi - Get all notifications for logged in user
router.get("/", notifikasiController.getUserNotifications);

// PATCH /api/notifikasi/:notifikasiId/read - Mark a specific notification as read
router.patch(
  "/:notifikasiId/read",
  notifikasiController.markNotificationAsRead
);

// PATCH /api/notifikasi/read-all - Mark all notifications as read
router.patch("/read-all", notifikasiController.markAllNotificationsAsRead);

// DELETE /api/notifikasi/:notifikasiId - Delete a specific notification
router.delete("/:notifikasiId", notifikasiController.deleteNotification);

// DELETE /api/notifikasi - Delete all notifications for the user
router.delete("/", notifikasiController.deleteAllNotifications);

// POST /api/notifikasi - Create a new notification (admin only)
router.post("/", authorizeAdmin, notifikasiController.createNotification);

module.exports = router;
