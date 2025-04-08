const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");
const { upload } = require("../utils/fileUpload");

// Public routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Protected routes (requires authentication)
router.get("/me", authenticate, userController.getUserProfile);
router.put("/me", authenticate, userController.updateUserProfile);
router.delete("/me", authenticate, userController.deleteUserAccount);
router.put("/change-password", authenticate, userController.changePassword);
router.put(
  "/update-profile-picture",
  authenticate,
  upload.single("foto_profil"),
  userController.updateProfilePicture
);

// Admin routes
router.get("/", authenticate, authorizeAdmin, userController.getAllUsers);
router.get("/:userId", authenticate, userController.getUserById);
router.put(
  "/:userId/status",
  authenticate,
  authorizeAdmin,
  userController.updateUserStatus
);
router.post(
  "/admin",
  authenticate,
  authorizeAdmin,
  userController.createAdminAccount
);

module.exports = router;
