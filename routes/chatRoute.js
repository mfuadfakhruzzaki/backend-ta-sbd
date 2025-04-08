const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { authenticate } = require("../middleware/auth");

// Protect all chat routes with authentication
router.use(authenticate);

// GET /api/chat - Get all user's conversations
router.get("/", chatController.getUserConversations);

// GET /api/chat/:userId - Get all chat messages with a specific user
router.get("/:userId", chatController.getChatWithUser);

// GET /api/chat/:userId/barang/:barangId - Get chat messages about a specific product with a user
router.get(
  "/:userId/barang/:barangId",
  chatController.getChatWithUserAboutProduct
);

// POST /api/chat - Send a new message
router.post("/", chatController.sendMessage);

// PATCH /api/chat/read - Mark messages as read
router.patch("/read", chatController.markMessagesAsRead);

module.exports = router;
