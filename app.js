const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const { sequelize } = require("./config/database");
const { errorHandler } = require("./middleware/errorHandler");
const { authLimiter, apiLimiter } = require("./middleware/rateLimiter");
const corsMiddleware = require("./middleware/cors");

// Import routes
const userRoute = require("./routes/userRoute");
const kategoriRoute = require("./routes/kategoriRoute");
const barangRoute = require("./routes/barangRoute");
const wishlistRoute = require("./routes/wishlistRoute");
const transaksiRoute = require("./routes/transaksiRoute");
const ratingRoute = require("./routes/ratingRoute");
const chatRoute = require("./routes/chatRoute");
const notifikasiRoute = require("./routes/notifikasiRoute");
const laporanRoute = require("./routes/laporanRoute");

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(corsMiddleware);
app.use(compression());

// Rate limiting
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/api/", apiLimiter);

// Logging middleware
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/users", userRoute);
app.use("/api/kategori", kategoriRoute);
app.use("/api/barang", barangRoute);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/transaksi", transaksiRoute);
app.use("/api/rating", ratingRoute);
app.use("/api/chat", chatRoute);
app.use("/api/notifikasi", notifikasiRoute);
app.use("/api/laporan", laporanRoute);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    domain: req.hostname,
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to E-Commerce Barang Bekas API",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    domain: req.hostname,
  });
});

// 404 route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Database sync and server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Sync database models
    await sequelize.sync();
    console.log("Database connected successfully.");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`API URL: https://api.fuadfakhruz.id`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
