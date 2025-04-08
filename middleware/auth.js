const { verifyToken } = require("../utils/auth");

/**
 * Middleware to authenticate users via JWT token
 */
const authenticate = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  // Verify token
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid token. Access denied.",
    });
  }

  // Add user info to request object
  req.user = decoded;
  next();
};

/**
 * Middleware to restrict access to admin users
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  next();
};

/**
 * Middleware to check if user owns the resource
 * @param {Function} getResourceOwner - Function to get the owner ID of the resource
 */
const isOwner = (getResourceOwner) => {
  return async (req, res, next) => {
    try {
      const ownerId = await getResourceOwner(req);

      if (ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You do not own this resource.",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error checking resource ownership",
      });
    }
  };
};

/**
 * Middleware to validate request body against a schema
 * @param {Object} schema - Joi schema for validation
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorizeAdmin: isAdmin,
  isOwner,
  validateRequest,
};
