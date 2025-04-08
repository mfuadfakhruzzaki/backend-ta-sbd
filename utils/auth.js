const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/**
 * Generate a JWT token for authenticated users
 * @param {Object} user - User data to encode in the token
 * @returns {String} - JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.user_id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Hash a plain text password
 * @param {String} password - Plain text password
 * @returns {String} - Hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare a plain text password with a hashed password
 * @param {String} password - Plain text password
 * @param {String} hashedPassword - Hashed password from database
 * @returns {Boolean} - True if passwords match, false otherwise
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Verify a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  verifyToken,
};
