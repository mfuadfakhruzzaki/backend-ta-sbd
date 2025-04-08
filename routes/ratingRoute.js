const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const { authenticate } = require("../middleware/auth");

// Protect all rating routes with authentication
router.use(authenticate);

// GET /api/rating/user/:userId - Get all ratings for a specific user
router.get("/user/:userId", ratingController.getUserRatings);

// GET /api/rating/:ratingId - Get a specific rating by ID
router.get("/:ratingId", ratingController.getRatingById);

// GET /api/rating/transaksi/:transaksiId - Get rating by transaction ID
router.get("/transaksi/:transaksiId", ratingController.getRatingByTransaksi);

// POST /api/rating - Create a new rating
router.post("/", ratingController.createRating);

module.exports = router;
