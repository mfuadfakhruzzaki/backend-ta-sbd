const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const { authenticate } = require("../middleware/auth");

// All wishlist routes require authentication
router.use(authenticate);

// Get user's wishlist
router.get("/", wishlistController.getUserWishlist);

// Add to wishlist
router.post("/", wishlistController.addToWishlist);

// Remove from wishlist
router.delete("/:id", wishlistController.removeFromWishlist);

// Check if item is in wishlist
router.get("/check/:barangId", wishlistController.checkWishlistItem);

module.exports = router;
