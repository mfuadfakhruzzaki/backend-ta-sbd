const { Kategori } = require("../models");
const { ApiError } = require("../middleware/errorHandler");

// Get all categories
const getAllKategori = async (req, res, next) => {
  try {
    const categories = await Kategori.findAll();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// Get category by ID
const getKategoriById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Kategori.findByPk(id);

    if (!category) {
      throw new ApiError("Category not found", 404);
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Create new category (admin only)
const createKategori = async (req, res, next) => {
  try {
    const { nama_kategori, deskripsi, icon } = req.body;

    // Check if category already exists
    const existingCategory = await Kategori.findOne({
      where: { nama_kategori },
    });

    if (existingCategory) {
      throw new ApiError("Category with this name already exists", 400);
    }

    const newCategory = await Kategori.create({
      nama_kategori,
      deskripsi,
      icon,
    });

    res.status(201).json({
      success: true,
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

// Update category (admin only)
const updateKategori = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_kategori, deskripsi, icon } = req.body;

    const category = await Kategori.findByPk(id);

    if (!category) {
      throw new ApiError("Category not found", 404);
    }

    // If name is being changed, check if it already exists
    if (nama_kategori && nama_kategori !== category.nama_kategori) {
      const existingCategory = await Kategori.findOne({
        where: { nama_kategori },
      });

      if (existingCategory) {
        throw new ApiError("Category with this name already exists", 400);
      }
    }

    await category.update({
      nama_kategori: nama_kategori || category.nama_kategori,
      deskripsi: deskripsi || category.deskripsi,
      icon: icon || category.icon,
    });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Delete category (admin only)
const deleteKategori = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Kategori.findByPk(id, {
      include: "Barangs",
    });

    if (!category) {
      throw new ApiError("Category not found", 404);
    }

    // Check if category has products
    if (category.Barangs && category.Barangs.length > 0) {
      throw new ApiError("Cannot delete category with existing products", 400);
    }

    await category.destroy();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllKategori,
  getKategoriById,
  createKategori,
  updateKategori,
  deleteKategori,
};
