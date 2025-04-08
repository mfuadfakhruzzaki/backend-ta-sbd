const { Wishlist, Barang, Kategori, User } = require("../models");
const { ApiError } = require("../middleware/errorHandler");

// Get all wishlist items for a user
const getUserWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const wishlistItems = await Wishlist.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Barang,
          include: [
            {
              model: Kategori,
              attributes: ["kategori_id", "nama_kategori"],
            },
            {
              model: User,
              attributes: ["user_id", "nama"],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: wishlistItems.length,
      data: wishlistItems,
    });
  } catch (error) {
    next(error);
  }
};

// Add item to wishlist
const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { barang_id } = req.body;

    // Check if product exists
    const product = await Barang.findByPk(barang_id);

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    // Check if product is already in wishlist
    const existingItem = await Wishlist.findOne({
      where: {
        user_id: userId,
        barang_id,
      },
    });

    if (existingItem) {
      throw new ApiError("Product already in wishlist", 400);
    }

    // Add to wishlist
    const wishlistItem = await Wishlist.create({
      user_id: userId,
      barang_id,
    });

    // Fetch with associations
    const itemWithProduct = await Wishlist.findByPk(wishlistItem.wishlist_id, {
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
      ],
    });

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      data: itemWithProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from wishlist
const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const wishlistItem = await Wishlist.findByPk(id);

    if (!wishlistItem) {
      throw new ApiError("Wishlist item not found", 404);
    }

    // Check if user owns the wishlist item
    if (wishlistItem.user_id !== userId) {
      throw new ApiError("Not authorized to delete this item", 403);
    }

    await wishlistItem.destroy();

    res.status(200).json({
      success: true,
      message: "Item removed from wishlist",
    });
  } catch (error) {
    next(error);
  }
};

// Check if item is in user's wishlist
const checkWishlistItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { barangId } = req.params;

    const wishlistItem = await Wishlist.findOne({
      where: {
        user_id: userId,
        barang_id: barangId,
      },
    });

    res.status(200).json({
      success: true,
      isInWishlist: !!wishlistItem,
      data: wishlistItem
        ? {
            wishlist_id: wishlistItem.wishlist_id,
            user_id: wishlistItem.user_id,
            barang_id: wishlistItem.barang_id,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistItem,
};
