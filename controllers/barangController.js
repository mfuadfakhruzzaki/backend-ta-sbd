const { Barang, Kategori, User } = require("../models");
const { ApiError } = require("../middleware/errorHandler");
const { Op } = require("sequelize");
const { upload, uploadFile, deleteFile } = require("../utils/fileUpload");

// Get all products with optional filtering
const getAllBarang = async (req, res, next) => {
  try {
    const {
      kategori_id,
      harga_min,
      harga_max,
      kondisi,
      keyword,
      lokasi,
      sort = "newest",
    } = req.query;

    // Build where clause
    const whereClause = {
      status_delete: 0,
      status: "tersedia",
    };

    // Add filters if provided
    if (kategori_id) whereClause.kategori_id = kategori_id;
    if (kondisi) whereClause.kondisi = kondisi;
    if (lokasi) whereClause.lokasi = { [Op.like]: `%${lokasi}%` };

    // Price range filter
    if (harga_min || harga_max) {
      whereClause.harga = {};
      if (harga_min) whereClause.harga[Op.gte] = harga_min;
      if (harga_max) whereClause.harga[Op.lte] = harga_max;
    }

    // Keyword search in title and description
    if (keyword) {
      whereClause[Op.or] = [
        { judul: { [Op.like]: `%${keyword}%` } },
        { deskripsi: { [Op.like]: `%${keyword}%` } },
      ];
    }

    // Determine sort order
    let order;
    switch (sort) {
      case "price_low":
        order = [["harga", "ASC"]];
        break;
      case "price_high":
        order = [["harga", "DESC"]];
        break;
      case "oldest":
        order = [["created_at", "ASC"]];
        break;
      case "newest":
      default:
        order = [["created_at", "DESC"]];
    }

    const products = await Barang.findAll({
      where: whereClause,
      include: [
        {
          model: Kategori,
          attributes: ["kategori_id", "nama_kategori"],
        },
        {
          model: User,
          attributes: ["user_id", "nama", "kampus"],
        },
      ],
      order,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// Get product by ID
const getBarangById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Barang.findByPk(id, {
      include: [
        {
          model: Kategori,
          attributes: ["kategori_id", "nama_kategori"],
        },
        {
          model: User,
          attributes: ["user_id", "nama", "nomor_telepon", "kampus"],
        },
      ],
    });

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    // Increment view count
    await product.update({
      views_count: product.views_count + 1,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Create new product
const createBarang = async (req, res, next) => {
  try {
    const { kategori_id, judul, deskripsi, harga, lokasi, kondisi } = req.body;
    const userId = req.user.id;

    // Check if category exists
    const category = await Kategori.findByPk(kategori_id);
    if (!category) {
      throw new ApiError("Category not found", 404);
    }

    // Upload files if any
    let fileUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const result = await uploadFile(file.buffer, file.originalname);
        return result.url;
      });
      fileUrls = await Promise.all(uploadPromises);
    }

    // Create product
    const newProduct = await Barang.create({
      user_id: userId,
      kategori_id,
      judul,
      deskripsi,
      foto_barang: fileUrls.join(","),
      harga,
      lokasi,
      kondisi,
      views_count: 0,
      status: "tersedia",
      status_delete: 0,
    });

    // Fetch with associations
    const productWithAssociations = await Barang.findByPk(
      newProduct.barang_id,
      {
        include: [
          {
            model: Kategori,
            attributes: ["kategori_id", "nama_kategori"],
          },
          {
            model: User,
            attributes: ["user_id", "nama"],
          },
        ],
      }
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: productWithAssociations,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

// Update product
const updateBarang = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { kategori_id, judul, deskripsi, harga, lokasi, kondisi, status } =
      req.body;
    const userId = req.user.id;

    const product = await Barang.findByPk(id);

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    // Check if user owns the product or is admin
    if (product.user_id !== userId && req.user.role !== "admin") {
      throw new ApiError("Not authorized to update this product", 403);
    }

    // If kategori_id is provided, check if it exists
    if (kategori_id) {
      const category = await Kategori.findByPk(kategori_id);
      if (!category) {
        throw new ApiError("Category not found", 404);
      }
    }

    // Handle file updates if any
    let fileUrls = product.foto_barang ? product.foto_barang.split(",") : [];

    if (req.files && req.files.length > 0) {
      // Upload new files
      const uploadPromises = req.files.map(async (file) => {
        const result = await uploadFile(file.buffer, file.originalname);
        return result.url;
      });
      const newFileUrls = await Promise.all(uploadPromises);

      // Combine with existing URLs
      fileUrls = [...fileUrls, ...newFileUrls];
    }

    // Update product
    await product.update({
      kategori_id: kategori_id || product.kategori_id,
      judul: judul || product.judul,
      deskripsi: deskripsi || product.deskripsi,
      foto_barang: fileUrls.join(","),
      harga: harga || product.harga,
      lokasi: lokasi || product.lokasi,
      kondisi: kondisi || product.kondisi,
      status: status || product.status,
    });

    // Fetch updated product with associations
    const updatedProduct = await Barang.findByPk(id, {
      include: [
        {
          model: Kategori,
          attributes: ["kategori_id", "nama_kategori"],
        },
        {
          model: User,
          attributes: ["user_id", "nama"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
};

// Soft delete product
const softDeleteBarang = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await Barang.findByPk(id);

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    // Check if user owns the product or is admin
    if (product.user_id !== userId && req.user.role !== "admin") {
      throw new ApiError("Not authorized to delete this product", 403);
    }

    // Soft delete product
    await product.update({
      status_delete: 1,
      status: "terjual",
      deleted_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Hard delete product (admin only)
const hardDeleteBarang = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Barang.findByPk(id);

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    // Delete associated files from PocketBase
    if (product.foto_barang) {
      const fileIds = product.foto_barang.split(",");
      const deletePromises = fileIds.map((fileId) => deleteFile(fileId));
      await Promise.all(deletePromises);
    }

    // Hard delete product
    await product.destroy({ force: true });

    res.status(200).json({
      success: true,
      message: "Product permanently deleted",
    });
  } catch (error) {
    next(error);
  }
};

// Get products by user ID
const getBarangByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const products = await Barang.findAll({
      where: {
        user_id: userId,
        status_delete: 0,
      },
      include: [
        {
          model: Kategori,
          attributes: ["kategori_id", "nama_kategori"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// Search and filter products
const searchFilterBarang = async (req, res, next) => {
  try {
    const {
      keyword,
      kategori_id,
      harga_min,
      harga_max,
      kondisi,
      lokasi,
      kampus,
    } = req.query;

    // Build where clause
    const whereClause = {
      status_delete: 0,
      status: "tersedia",
    };

    // Keyword search in title and description
    if (keyword) {
      whereClause[Op.or] = [
        { judul: { [Op.like]: `%${keyword}%` } },
        { deskripsi: { [Op.like]: `%${keyword}%` } },
      ];
    }

    // Add filters if provided
    if (kategori_id) whereClause.kategori_id = kategori_id;
    if (kondisi) whereClause.kondisi = kondisi;
    if (lokasi) whereClause.lokasi = { [Op.like]: `%${lokasi}%` };

    // Price range filter
    if (harga_min || harga_max) {
      whereClause.harga = {};
      if (harga_min) whereClause.harga[Op.gte] = harga_min;
      if (harga_max) whereClause.harga[Op.lte] = harga_max;
    }

    // Include conditions for User
    const userInclude = {
      model: User,
      attributes: ["user_id", "nama", "kampus"],
    };

    // Filter by campus
    if (kampus) {
      userInclude.where = { kampus: { [Op.like]: `%${kampus}%` } };
    }

    const products = await Barang.findAll({
      where: whereClause,
      include: [
        {
          model: Kategori,
          attributes: ["kategori_id", "nama_kategori"],
        },
        userInclude,
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBarang,
  getBarangById,
  createBarang,
  updateBarang,
  softDeleteBarang,
  hardDeleteBarang,
  getBarangByUserId,
  searchFilterBarang,
};
