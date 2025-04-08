const { Laporan, User, Barang, Notifikasi } = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const { sequelize } = require("../config/database");

// Create a new report
const createReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { barang_id, alasan, deskripsi } = req.body;

    // Check if product exists
    const product = await Barang.findByPk(barang_id);
    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    // Check if user has already reported this product
    const existingReport = await Laporan.findOne({
      where: {
        user_id: userId,
        barang_id,
      },
    });

    if (existingReport) {
      throw new ApiError("You have already reported this product", 400);
    }

    const dbTransaction = await sequelize.transaction();

    try {
      // Create report
      const newReport = await Laporan.create(
        {
          user_id: userId,
          barang_id,
          alasan,
          deskripsi,
          status: "pending",
          tanggal: new Date(),
        },
        { transaction: dbTransaction }
      );

      // Get admin users
      const admins = await User.findAll({
        where: { is_admin: 1 },
      });

      // Create notifications for admins
      const reporter = await User.findByPk(userId);

      // Create notification for each admin
      for (const admin of admins) {
        await Notifikasi.create(
          {
            user_id: admin.user_id,
            judul: "New Product Report",
            pesan: `${reporter.nama} has reported the product "${product.judul}"`,
            jenis: "report",
            is_read: 0,
          },
          { transaction: dbTransaction }
        );
      }

      await dbTransaction.commit();

      res.status(201).json({
        success: true,
        message: "Report submitted successfully",
        data: newReport,
      });
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Get all reports (admin only)
const getAllReports = async (req, res, next) => {
  try {
    // Verify admin status
    if (!req.user.is_admin) {
      throw new ApiError("Only admin can access all reports", 403);
    }

    const { status } = req.query;

    // Build query based on status filter
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const reports = await Laporan.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "reporter",
          attributes: ["user_id", "nama", "email"],
        },
        {
          model: Barang,
          include: [
            {
              model: User,
              as: "penjual",
              attributes: ["user_id", "nama", "email"],
            },
          ],
        },
      ],
      order: [["tanggal", "DESC"]],
    });

    const counts = {
      total: await Laporan.count(),
      pending: await Laporan.count({ where: { status: "pending" } }),
      processed: await Laporan.count({ where: { status: "processed" } }),
      rejected: await Laporan.count({ where: { status: "rejected" } }),
    };

    res.status(200).json({
      success: true,
      count: reports.length,
      counts,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// Get reports by user
const getUserReports = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const reports = await Laporan.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Barang,
          attributes: ["barang_id", "judul", "foto"],
        },
      ],
      order: [["tanggal", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// Get report by ID (admin or owner only)
const getReportById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { reportId } = req.params;

    const report = await Laporan.findByPk(reportId, {
      include: [
        {
          model: User,
          as: "reporter",
          attributes: ["user_id", "nama", "email"],
        },
        {
          model: Barang,
          include: [
            {
              model: User,
              as: "penjual",
              attributes: ["user_id", "nama", "email"],
            },
          ],
        },
      ],
    });

    // Check if report exists
    if (!report) {
      throw new ApiError("Report not found", 404);
    }

    // Check authorization (admin or owner)
    if (!req.user.is_admin && report.user_id !== userId) {
      throw new ApiError("Unauthorized access to report", 403);
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// Update report status (admin only)
const updateReportStatus = async (req, res, next) => {
  try {
    // Verify admin status
    if (!req.user.is_admin) {
      throw new ApiError("Only admin can update report status", 403);
    }

    const { reportId } = req.params;
    const { status, admin_note } = req.body;

    // Validate status
    if (!["pending", "processed", "rejected"].includes(status)) {
      throw new ApiError("Invalid status value", 400);
    }

    // Find report
    const report = await Laporan.findByPk(reportId, {
      include: [
        {
          model: Barang,
          attributes: ["barang_id", "judul"],
        },
      ],
    });

    // Check if report exists
    if (!report) {
      throw new ApiError("Report not found", 404);
    }

    const dbTransaction = await sequelize.transaction();

    try {
      // Update report
      report.status = status;
      report.admin_note = admin_note;
      report.tanggal_proses = new Date();

      await report.save({ transaction: dbTransaction });

      // Create notification for the reporter
      await Notifikasi.create(
        {
          user_id: report.user_id,
          judul: "Report Status Updated",
          pesan: `Your report for "${report.Barang.judul}" has been ${status}`,
          jenis: "report",
          is_read: 0,
        },
        { transaction: dbTransaction }
      );

      await dbTransaction.commit();

      res.status(200).json({
        success: true,
        message: "Report status updated successfully",
        data: report,
      });
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Delete a report (admin only)
const deleteReport = async (req, res, next) => {
  try {
    // Verify admin status
    if (!req.user.is_admin) {
      throw new ApiError("Only admin can delete reports", 403);
    }

    const { reportId } = req.params;

    // Find report
    const report = await Laporan.findByPk(reportId);

    // Check if report exists
    if (!report) {
      throw new ApiError("Report not found", 404);
    }

    // Delete report
    await report.destroy();

    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getAllReports,
  getUserReports,
  getReportById,
  updateReportStatus,
  deleteReport,
};
