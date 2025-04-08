const { User } = require("../models");
const {
  generateToken,
  hashPassword,
  comparePassword,
} = require("../utils/auth");
const { ApiError } = require("../middleware/errorHandler");

// Register a new user
const register = async (req, res, next) => {
  try {
    const { nama, email, password, nomor_telepon, alamat, kampus, is_admin } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      throw new ApiError("Email already in use", 400);
    }

    // Hash password before saving
    const hashedPassword = await hashPassword(password);

    // Create new user with role admin if is_admin is true (temporary feature)
    const role = is_admin === true ? "admin" : "mahasiswa";

    // Create new user
    const newUser = await User.create({
      nama,
      email,
      password: hashedPassword,
      nomor_telepon,
      alamat,
      kampus,
      role: role,
      status_akun: "aktif",
    });

    // Generate token
    const token = generateToken(newUser);

    // Return user data and token
    res.status(201).json({
      success: true,
      data: {
        user_id: newUser.user_id,
        nama: newUser.nama,
        email: newUser.email,
        role: newUser.role,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new ApiError("Invalid email or password", 401);
    }

    // Check if account is blocked
    if (user.status_akun === "diblokir") {
      throw new ApiError("Your account has been blocked", 403);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new ApiError("Invalid email or password", 401);
    }

    // Generate token
    const token = generateToken(user);

    // Return user data and token
    res.status(200).json({
      success: true,
      data: {
        user_id: user.user_id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { nama, nomor_telepon, alamat, kampus } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Update user
    await user.update({
      nama: nama || user.nama,
      nomor_telepon: nomor_telepon || user.nomor_telepon,
      alamat: alamat || user.alamat,
      kampus: kampus || user.kampus,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user_id: user.user_id,
        nama: user.nama,
        email: user.email,
        nomor_telepon: user.nomor_telepon,
        alamat: user.alamat,
        kampus: user.kampus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      current_password,
      user.password
    );

    if (!isPasswordValid) {
      throw new ApiError("Current password is incorrect", 401);
    }

    // Hash new password
    const hashedPassword = await hashPassword(new_password);

    // Update password
    await user.update({ password: hashedPassword });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update user status (block/unblock)
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status_akun } = req.body;

    if (!status_akun || !["aktif", "diblokir"].includes(status_akun)) {
      throw new ApiError('Invalid status. Must be "aktif" or "diblokir"', 400);
    }

    const user = await User.findByPk(id);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Cannot update admin status
    if (user.role === "admin") {
      throw new ApiError("Cannot update admin status", 403);
    }

    await user.update({ status_akun });

    res.status(200).json({
      success: true,
      message: `User status updated to ${status_akun}`,
      data: {
        user_id: user.user_id,
        nama: user.nama,
        email: user.email,
        status_akun: user.status_akun,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete user account
const deleteUserAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Delete user
    await user.destroy();

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update profile picture
const updateProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      throw new ApiError("No image file uploaded", 400);
    }

    const user = await User.findByPk(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Upload file to Appwrite
    const { uploadToAppwrite } = require("../utils/fileUpload");

    // Handle both memory storage (req.file.buffer) and disk storage (req.file.path)
    let fileData;
    if (req.file.buffer) {
      // Memory storage - use buffer directly
      fileData = req.file.buffer;
    } else if (req.file.path) {
      // Disk storage - read file from disk
      const fs = require("fs");
      fileData = fs.readFileSync(req.file.path);

      // Clean up file after uploading
      fs.unlinkSync(req.file.path);
    } else {
      throw new ApiError("Invalid file upload", 400);
    }

    const result = await uploadToAppwrite(fileData, req.file.originalname);

    // Update profile picture with the URL from Appwrite
    await user.update({ foto_profil: result.fileUrl });

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      data: {
        foto_profil: user.foto_profil,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create admin account (super admin only)
const createAdminAccount = async (req, res, next) => {
  try {
    // Only super admin can create admin accounts
    if (req.user.role !== "admin") {
      throw new ApiError("You are not authorized to perform this action", 403);
    }

    const { nama, email, password, nomor_telepon, alamat, kampus } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      throw new ApiError("Email already in use", 400);
    }

    // Hash password before saving
    const hashedPassword = await hashPassword(password);

    // Create new admin user
    const newAdmin = await User.create({
      nama,
      email,
      password: hashedPassword,
      nomor_telepon,
      alamat,
      kampus,
      role: "admin",
      status_akun: "aktif",
    });

    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      data: {
        user_id: newAdmin.user_id,
        nama: newAdmin.nama,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser: register,
  loginUser: login,
  getUserProfile: getProfile,
  updateUserProfile: updateProfile,
  deleteUserAccount,
  changePassword,
  updateProfilePicture,
  getAllUsers,
  getUserById,
  updateUserStatus,
  createAdminAccount,
};
