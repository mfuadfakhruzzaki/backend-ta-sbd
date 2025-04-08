const express = require("express");
const router = express.Router();
const laporanController = require("../controllers/laporanController");
const { authenticate, authorizeAdmin } = require("../middleware/auth");

// Protect all report routes with authentication
router.use(authenticate);

// POST /api/laporan - Create a new report
router.post("/", laporanController.createReport);

// GET /api/laporan - Get all reports (admin only)
router.get("/", authorizeAdmin, laporanController.getAllReports);

// GET /api/laporan/user - Get reports by logged in user
router.get("/user", laporanController.getUserReports);

// GET /api/laporan/:reportId - Get a specific report (admin or report owner)
router.get("/:reportId", laporanController.getReportById);

// PATCH /api/laporan/:reportId/status - Update report status (admin only)
router.patch(
  "/:reportId/status",
  authorizeAdmin,
  laporanController.updateReportStatus
);

// DELETE /api/laporan/:reportId - Delete a report (admin only)
router.delete("/:reportId", authorizeAdmin, laporanController.deleteReport);

module.exports = router;
