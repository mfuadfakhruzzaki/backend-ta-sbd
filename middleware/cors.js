const cors = require("cors");

const corsOptions = {
  origin: "*", // Allow all origins with wildcard
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 hours
};

module.exports = cors(corsOptions);
