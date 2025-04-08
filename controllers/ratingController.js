const { Rating, Transaksi, User, Barang } = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const { sequelize } = require("../config/database");

// Get all ratings for a user
const getUserRatings = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Get ratings where user is being reviewed
    const ratings = await Rating.findAll({
      where: { reviewed_id: userId },
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["user_id", "nama", "profile_picture"],
        },
        {
          model: Transaksi,
          include: [
            {
              model: Barang,
              attributes: ["barang_id", "judul", "foto"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Calculate average rating
    const totalRatings = ratings.length;
    const ratingSum = ratings.reduce((sum, rating) => sum + rating.nilai, 0);
    const averageRating =
      totalRatings > 0 ? (ratingSum / totalRatings).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      count: totalRatings,
      averageRating: parseFloat(averageRating),
      data: ratings,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new rating
const createRating = async (req, res, next) => {
  try {
    const reviewerId = req.user.id;
    const { transaksi_id, nilai, review } = req.body;

    // Check if transaction exists and is completed
    const transaction = await Transaksi.findByPk(transaksi_id, {
      include: [
        { model: Barang },
        { model: User, as: "buyer" },
        { model: User, as: "seller" },
      ],
    });

    if (!transaction) {
      throw new ApiError("Transaction not found", 404);
    }

    if (transaction.status !== "selesai") {
      throw new ApiError("Cannot rate incomplete transaction", 400);
    }

    // Check if user is buyer or seller of the transaction
    if (
      transaction.buyer_id !== reviewerId &&
      transaction.seller_id !== reviewerId
    ) {
      throw new ApiError("Not authorized to rate this transaction", 403);
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      where: { transaksi_id },
    });

    if (existingRating) {
      throw new ApiError("Transaction has already been rated", 400);
    }

    // Determine who is being reviewed
    const reviewedId =
      reviewerId === transaction.buyer_id
        ? transaction.seller_id
        : transaction.buyer_id;

    const dbTransaction = await sequelize.transaction();

    try {
      // Create rating
      const newRating = await Rating.create(
        {
          transaksi_id,
          reviewer_id: reviewerId,
          reviewed_id: reviewedId,
          nilai,
          review,
        },
        { transaction: dbTransaction }
      );

      await dbTransaction.commit();

      // Fetch rating with associations
      const ratingWithDetails = await Rating.findByPk(newRating.rating_id, {
        include: [
          {
            model: User,
            as: "reviewer",
            attributes: ["user_id", "nama"],
          },
          {
            model: User,
            as: "reviewed",
            attributes: ["user_id", "nama"],
          },
          {
            model: Transaksi,
            include: [
              {
                model: Barang,
                attributes: ["barang_id", "judul"],
              },
            ],
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: "Rating created successfully",
        data: ratingWithDetails,
      });
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Get a rating by ID
const getRatingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rating = await Rating.findByPk(id, {
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["user_id", "nama", "profile_picture"],
        },
        {
          model: User,
          as: "reviewed",
          attributes: ["user_id", "nama", "profile_picture"],
        },
        {
          model: Transaksi,
          include: [
            {
              model: Barang,
              attributes: ["barang_id", "judul", "foto"],
            },
          ],
        },
      ],
    });

    if (!rating) {
      throw new ApiError("Rating not found", 404);
    }

    res.status(200).json({
      success: true,
      data: rating,
    });
  } catch (error) {
    next(error);
  }
};

// Get rating for a transaction
const getRatingByTransaksi = async (req, res, next) => {
  try {
    const { transaksiId } = req.params;

    // Check if transaction exists
    const transaction = await Transaksi.findByPk(transaksiId);
    if (!transaction) {
      throw new ApiError("Transaction not found", 404);
    }

    const rating = await Rating.findOne({
      where: { transaksi_id: transaksiId },
      include: [
        {
          model: User,
          as: "reviewer",
          attributes: ["user_id", "nama", "profile_picture"],
        },
        {
          model: User,
          as: "reviewed",
          attributes: ["user_id", "nama", "profile_picture"],
        },
      ],
    });

    if (!rating) {
      return res.status(200).json({
        success: true,
        message: "No rating found for this transaction",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: rating,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserRatings,
  createRating,
  getRatingById,
  getRatingByTransaksi,
};
