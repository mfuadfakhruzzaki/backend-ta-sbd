const cors = require("cors");

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://sbd.fuadfakhruz.id", "https://api.fuadfakhruz.id"]
      : ["http://localhost:3000", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 hours
};

module.exports = cors(corsOptions);
