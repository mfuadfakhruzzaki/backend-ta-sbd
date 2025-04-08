const { Transaksi, Barang, User, Kategori, Notifikasi } = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const { sequelize } = require("../config/database");

// Get all transactions
const getAllTransaksi = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Users can only see their own transactions, admins can see all
    const whereClause =
      req.user.role !== "admin"
        ? { [sequelize.Op.or]: [{ buyer_id: userId }, { seller_id: userId }] }
        : {};

    const transactions = await Transaksi.findAll({
      where: whereClause,
      include: [
        {
          model: Barang,
          include: [
            {
              model: Kategori,
              attributes: ["kategori_id", "nama_kategori"],
            },
          ],
        },
        {
          model: User,
          as: "buyer",
          attributes: ["user_id", "nama", "email", "nomor_telepon"],
        },
        {
          model: User,
          as: "seller",
          attributes: ["user_id", "nama", "email", "nomor_telepon"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new transaction
const createTransaksi = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const { barang_id, metode_pembayaran, catatan } = req.body;

    // Check if product exists and is available
    const product = await Barang.findByPk(barang_id, {
      include: [{ model: User }],
    });

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    if (product.status !== "tersedia") {
      throw new ApiError("Product is not available for purchase", 400);
    }

    // Buyer cannot buy their own product
    if (product.user_id === buyerId) {
      throw new ApiError("You cannot buy your own product", 400);
    }

    const sellerId = product.user_id;
    const transaction = await sequelize.transaction();

    try {
      // Create transaction
      const newTransaksi = await Transaksi.create(
        {
          barang_id,
          seller_id: sellerId,
          buyer_id: buyerId,
          tanggal_transaksi: new Date(),
          metode_pembayaran,
          total_harga: product.harga,
          status: "pending",
          catatan,
        },
        { transaction }
      );

      // Update product status
      await product.update(
        {
          status: "dipesan",
        },
        { transaction }
      );

      // Create notification for seller
      await Notifikasi.create(
        {
          user_id: sellerId,
          judul: "New Order",
          pesan: `Your product "${product.judul}" has a new order.`,
          jenis: "transaksi",
          is_read: 0,
        },
        { transaction }
      );

      await transaction.commit();

      // Fetch transaction with associations
      const transactionWithDetails = await Transaksi.findByPk(
        newTransaksi.transaksi_id,
        {
          include: [
            {
              model: Barang,
              include: [{ model: Kategori }],
            },
            {
              model: User,
              as: "buyer",
              attributes: ["user_id", "nama", "email"],
            },
            {
              model: User,
              as: "seller",
              attributes: ["user_id", "nama", "email"],
            },
          ],
        }
      );

      res.status(201).json({
        success: true,
        message: "Transaction created successfully",
        data: transactionWithDetails,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Get transaction by ID
const getTransaksiById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await Transaksi.findByPk(id, {
      include: [
        {
          model: Barang,
          include: [
            {
              model: Kategori,
              attributes: ["kategori_id", "nama_kategori"],
            },
          ],
        },
        {
          model: User,
          as: "buyer",
          attributes: ["user_id", "nama", "email", "nomor_telepon", "alamat"],
        },
        {
          model: User,
          as: "seller",
          attributes: ["user_id", "nama", "email", "nomor_telepon", "alamat"],
        },
      ],
    });

    if (!transaction) {
      throw new ApiError("Transaction not found", 404);
    }

    // Only buyer, seller, or admin can view transaction details
    if (
      transaction.buyer_id !== userId &&
      transaction.seller_id !== userId &&
      req.user.role !== "admin"
    ) {
      throw new ApiError("Not authorized to view this transaction", 403);
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// Update transaction status
const updateTransaksiStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (
      !status ||
      ![
        "pending",
        "dibayar",
        "diproses",
        "dikirim",
        "selesai",
        "dibatalkan",
      ].includes(status)
    ) {
      throw new ApiError("Invalid status value", 400);
    }

    const transaction = await Transaksi.findByPk(id, {
      include: [
        { model: Barang },
        { model: User, as: "buyer" },
        { model: User, as: "seller" },
      ],
    });

    if (!transaction) {
      throw new ApiError("Transaction not found", 404);
    }

    // Validate permissions based on status update
    let allowUpdate = false;
    let notificationTarget;
    let notificationMessage;

    // Admin can update any status
    if (req.user.role === "admin") {
      allowUpdate = true;
    } else if (status === "dibatalkan") {
      // Both buyer and seller can cancel if still pending
      if (
        transaction.status === "pending" &&
        (transaction.buyer_id === userId || transaction.seller_id === userId)
      ) {
        allowUpdate = true;
        notificationTarget =
          transaction.buyer_id === userId
            ? transaction.seller_id
            : transaction.buyer_id;
        notificationMessage = `Transaction for "${transaction.Barang.judul}" has been cancelled.`;
      }
    } else if (status === "dibayar") {
      // Only buyer can mark as paid
      if (transaction.buyer_id === userId && transaction.status === "pending") {
        allowUpdate = true;
        notificationTarget = transaction.seller_id;
        notificationMessage = `Payment received for "${transaction.Barang.judul}".`;
      }
    } else if (status === "diproses" || status === "dikirim") {
      // Only seller can process or ship
      if (
        transaction.seller_id === userId &&
        (transaction.status === "dibayar" || transaction.status === "diproses")
      ) {
        allowUpdate = true;
        notificationTarget = transaction.buyer_id;
        notificationMessage =
          status === "diproses"
            ? `Your order for "${transaction.Barang.judul}" is being processed.`
            : `Your order for "${transaction.Barang.judul}" has been shipped.`;
      }
    } else if (status === "selesai") {
      // Only buyer can complete
      if (transaction.buyer_id === userId && transaction.status === "dikirim") {
        allowUpdate = true;
        notificationTarget = transaction.seller_id;
        notificationMessage = `Transaction for "${transaction.Barang.judul}" has been completed.`;
      }
    }

    if (!allowUpdate) {
      throw new ApiError(
        "Not authorized to update this transaction status",
        403
      );
    }

    const dbTransaction = await sequelize.transaction();

    try {
      // Update transaction status
      await transaction.update({ status }, { transaction: dbTransaction });

      // Update product status if transaction is completed or cancelled
      if (status === "selesai") {
        await transaction.Barang.update(
          {
            status: "terjual",
          },
          { transaction: dbTransaction }
        );
      } else if (status === "dibatalkan") {
        await transaction.Barang.update(
          {
            status: "tersedia",
          },
          { transaction: dbTransaction }
        );
      }

      // Create notification
      if (notificationTarget && notificationMessage) {
        await Notifikasi.create(
          {
            user_id: notificationTarget,
            judul: "Transaction Update",
            pesan: notificationMessage,
            jenis: "transaksi",
            is_read: 0,
          },
          { transaction: dbTransaction }
        );
      }

      await dbTransaction.commit();

      res.status(200).json({
        success: true,
        message: `Transaction status updated to ${status}`,
        data: {
          transaksi_id: transaction.transaksi_id,
          status: status,
          barang_id: transaction.barang_id,
          barang_status:
            status === "selesai"
              ? "terjual"
              : status === "dibatalkan"
              ? "tersedia"
              : transaction.Barang.status,
        },
      });
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Get transactions where user is buyer
const getTransaksiAsBuyer = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaksi.findAll({
      where: { buyer_id: userId },
      include: [
        {
          model: Barang,
          include: [
            {
              model: Kategori,
              attributes: ["kategori_id", "nama_kategori"],
            },
          ],
        },
        {
          model: User,
          as: "seller",
          attributes: ["user_id", "nama", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// Get transactions where user is seller
const getTransaksiAsSeller = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaksi.findAll({
      where: { seller_id: userId },
      include: [
        {
          model: Barang,
          include: [
            {
              model: Kategori,
              attributes: ["kategori_id", "nama_kategori"],
            },
          ],
        },
        {
          model: User,
          as: "buyer",
          attributes: ["user_id", "nama", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// Get transaction history with join query
const getTransaksiHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, sort_by = "newest" } = req.query;

    // Build where clause
    const whereClause =
      req.user.role !== "admin"
        ? { [sequelize.Op.or]: [{ buyer_id: userId }, { seller_id: userId }] }
        : {};

    // Add status filter if provided
    if (status) {
      whereClause.status = status;
    }

    // Determine sort order
    let order;
    switch (sort_by) {
      case "oldest":
        order = [["created_at", "ASC"]];
        break;
      case "price_high":
        order = [["total_harga", "DESC"]];
        break;
      case "price_low":
        order = [["total_harga", "ASC"]];
        break;
      case "newest":
      default:
        order = [["created_at", "DESC"]];
    }

    // Get transactions with join query
    const transactionHistory = await Transaksi.findAll({
      where: whereClause,
      attributes: [
        "transaksi_id",
        "status",
        "metode_pembayaran",
        "total_harga",
        "tanggal_transaksi",
        "created_at",
      ],
      include: [
        {
          model: Barang,
          attributes: ["barang_id", "judul", "harga", "foto"],
          include: [
            {
              model: Kategori,
              attributes: ["nama_kategori"],
            },
          ],
        },
        {
          model: User,
          as: "buyer",
          attributes: ["user_id", "nama", "kampus"],
        },
        {
          model: User,
          as: "seller",
          attributes: ["user_id", "nama", "kampus"],
        },
      ],
      order,
    });

    res.status(200).json({
      success: true,
      count: transactionHistory.length,
      data: transactionHistory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTransaksi,
  createTransaksi,
  getTransaksiById,
  updateTransaksiStatus,
  getTransaksiAsBuyer,
  getTransaksiAsSeller,
  getTransaksiHistory,
};
