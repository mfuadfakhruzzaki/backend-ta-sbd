const { Chat, User, Barang, Notifikasi } = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const { sequelize } = require("../config/database");
const { Op } = require("sequelize");

// Get all user's chat conversations
const getUserConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all unique conversations
    const chatParticipants = await sequelize.query(
      `
      SELECT 
        DISTINCT CASE 
          WHEN sender_id = :userId THEN receiver_id
          ELSE sender_id 
        END AS participant_id
      FROM CHAT
      WHERE sender_id = :userId OR receiver_id = :userId
    `,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (chatParticipants.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Get participant details and last message
    const participantIds = chatParticipants.map((p) => p.participant_id);

    // Get participants info
    const participants = await User.findAll({
      where: { user_id: participantIds },
      attributes: ["user_id", "nama", "profile_picture"],
    });

    // For each participant, get the last message
    const conversationsPromises = participants.map(async (participant) => {
      // Get last message with this user
      const lastMessage = await Chat.findOne({
        where: {
          [Op.or]: [
            {
              sender_id: userId,
              receiver_id: participant.user_id,
            },
            {
              sender_id: participant.user_id,
              receiver_id: userId,
            },
          ],
        },
        order: [["tanggal", "DESC"]],
        include: [
          {
            model: Barang,
            attributes: ["barang_id", "judul", "foto"],
          },
        ],
      });

      // Count unread messages from this user
      const unreadCount = await Chat.count({
        where: {
          sender_id: participant.user_id,
          receiver_id: userId,
          status_dibaca: 0,
        },
      });

      return {
        participant: participant,
        lastMessage: lastMessage,
        unreadCount: unreadCount,
      };
    });

    const conversations = await Promise.all(conversationsPromises);

    // Sort by last message date (most recent first)
    conversations.sort((a, b) => {
      if (!a.lastMessage || !b.lastMessage) return 0;
      return new Date(b.lastMessage.tanggal) - new Date(a.lastMessage.tanggal);
    });

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

// Get chat messages with a specific user
const getChatWithUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { userId: otherUserId } = req.params;

    // Check if other user exists
    const otherUser = await User.findByPk(otherUserId);
    if (!otherUser) {
      throw new ApiError("User not found", 404);
    }

    // Get chat messages
    const messages = await Chat.findAll({
      where: {
        [Op.or]: [
          {
            sender_id: userId,
            receiver_id: otherUserId,
          },
          {
            sender_id: otherUserId,
            receiver_id: userId,
          },
        ],
      },
      include: [
        {
          model: Barang,
          attributes: ["barang_id", "judul", "foto"],
        },
      ],
      order: [["tanggal", "ASC"]],
    });

    // Mark messages as read
    await Chat.update(
      { status_dibaca: 1 },
      {
        where: {
          sender_id: otherUserId,
          receiver_id: userId,
          status_dibaca: 0,
        },
      }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: {
        otherUser: {
          user_id: otherUser.user_id,
          nama: otherUser.nama,
          profile_picture: otherUser.profile_picture,
        },
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get chat messages about a specific product with a user
const getChatWithUserAboutProduct = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { userId: otherUserId, barangId } = req.params;

    // Check if other user exists
    const otherUser = await User.findByPk(otherUserId);
    if (!otherUser) {
      throw new ApiError("User not found", 404);
    }

    // Check if product exists
    const product = await Barang.findByPk(barangId);
    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    // Get chat messages
    const messages = await Chat.findAll({
      where: {
        barang_id: barangId,
        [Op.or]: [
          {
            sender_id: userId,
            receiver_id: otherUserId,
          },
          {
            sender_id: otherUserId,
            receiver_id: userId,
          },
        ],
      },
      order: [["tanggal", "ASC"]],
    });

    // Mark messages as read
    await Chat.update(
      { status_dibaca: 1 },
      {
        where: {
          barang_id: barangId,
          sender_id: otherUserId,
          receiver_id: userId,
          status_dibaca: 0,
        },
      }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: {
        otherUser: {
          user_id: otherUser.user_id,
          nama: otherUser.nama,
          profile_picture: otherUser.profile_picture,
        },
        product: {
          barang_id: product.barang_id,
          judul: product.judul,
          foto: product.foto,
        },
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Send a new message
const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, barang_id, pesan } = req.body;

    // Check if receiver exists
    const receiver = await User.findByPk(receiver_id);
    if (!receiver) {
      throw new ApiError("Receiver not found", 404);
    }

    // Check if product exists (if provided)
    if (barang_id) {
      const product = await Barang.findByPk(barang_id);
      if (!product) {
        throw new ApiError("Product not found", 404);
      }
    }

    const dbTransaction = await sequelize.transaction();

    try {
      // Create chat message
      const newMessage = await Chat.create(
        {
          sender_id: senderId,
          receiver_id,
          barang_id,
          pesan,
          status_dibaca: 0,
          tanggal: new Date(),
        },
        { transaction: dbTransaction }
      );

      // Create notification for receiver
      const sender = await User.findByPk(senderId);
      let notificationMessage;

      if (barang_id) {
        const product = await Barang.findByPk(barang_id);
        notificationMessage = `New message from ${sender.nama} about "${product.judul}"`;
      } else {
        notificationMessage = `New message from ${sender.nama}`;
      }

      await Notifikasi.create(
        {
          user_id: receiver_id,
          judul: "New Message",
          pesan: notificationMessage,
          jenis: "chat",
          is_read: 0,
        },
        { transaction: dbTransaction }
      );

      await dbTransaction.commit();

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: newMessage,
      });
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { sender_id } = req.body;

    // Check if sender exists
    const sender = await User.findByPk(sender_id);
    if (!sender) {
      throw new ApiError("Sender not found", 404);
    }

    // Update messages
    const result = await Chat.update(
      { status_dibaca: 1 },
      {
        where: {
          sender_id,
          receiver_id: userId,
          status_dibaca: 0,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      count: result[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserConversations,
  getChatWithUser,
  getChatWithUserAboutProduct,
  sendMessage,
  markMessagesAsRead,
};
