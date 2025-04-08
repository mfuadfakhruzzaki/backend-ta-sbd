const express = require("express");
const router = express.Router();
const barangController = require("../controllers/barangController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");
const { upload } = require("../utils/fileUpload");

// Public routes
router.get("/", barangController.getAllBarang);
router.get("/:id", barangController.getBarangById);
router.get("/user/:userId", barangController.getBarangByUserId);
router.get("/search", barangController.searchFilterBarang);

// Protected routes (requires authentication)
router.post(
  "/",
  authenticate,
  upload.array("foto", 5),
  barangController.createBarang
);

router.put(
  "/:id",
  authenticate,
  upload.array("foto", 5),
  barangController.updateBarang
);

router.delete("/:id", authenticate, barangController.softDeleteBarang);

// Admin only routes
router.delete(
  "/:id/hard",
  authenticate,
  authorizeAdmin,
  barangController.hardDeleteBarang
);

module.exports = router;
