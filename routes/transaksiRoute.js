const express = require("express");
const router = express.Router();
const transaksiController = require("../controllers/transaksiController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");

// All transaction routes require authentication
router.use(authenticate);

// Get all transactions
router.get("/", transaksiController.getAllTransaksi);

// Create a new transaction
router.post("/", transaksiController.createTransaksi);

// Get transaction by ID
router.get("/:id", transaksiController.getTransaksiById);

// Update transaction status
router.patch("/:id/status", transaksiController.updateTransaksiStatus);

// Get transactions as buyer
router.get("/as-buyer", transaksiController.getTransaksiAsBuyer);

// Get transactions as seller
router.get("/as-seller", transaksiController.getTransaksiAsSeller);

// Get transaction history
router.get("/history", transaksiController.getTransaksiHistory);

module.exports = router;
