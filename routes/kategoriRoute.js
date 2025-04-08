const express = require("express");
const router = express.Router();
const kategoriController = require("../controllers/kategoriController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");

// Public routes
router.get("/", kategoriController.getAllKategori);
router.get("/:id", kategoriController.getKategoriById);

// Admin only routes
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  kategoriController.createKategori
);
router.put(
  "/:id",
  authenticate,
  authorizeAdmin,
  kategoriController.updateKategori
);
router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  kategoriController.deleteKategori
);

module.exports = router;
