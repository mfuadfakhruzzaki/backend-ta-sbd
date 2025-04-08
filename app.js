const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const { sequelize } = require("./config/database");
const { errorHandler } = require("./middleware/errorHandler");

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

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to E-Commerce Barang Bekas API",
    version: "1.0.0",
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
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
