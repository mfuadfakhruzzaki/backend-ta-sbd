const Joi = require("joi");

// User registration validation schema
const registerSchema = Joi.object({
  nama: Joi.string().required().min(3).max(100),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  nomor_telepon: Joi.string().pattern(/^[0-9]{10,15}$/),
  alamat: Joi.string(),
  kampus: Joi.string().required(),
});

// User login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// User profile update validation schema
const updateProfileSchema = Joi.object({
  nama: Joi.string().min(3).max(100),
  nomor_telepon: Joi.string().pattern(/^[0-9]{10,15}$/),
  alamat: Joi.string(),
  kampus: Joi.string(),
});

// Password update validation schema
const updatePasswordSchema = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string().required().min(6),
  confirm_password: Joi.string().required().valid(Joi.ref("new_password")),
});

// Barang creation validation schema
const createBarangSchema = Joi.object({
  kategori_id: Joi.number().required(),
  judul: Joi.string().required().min(5).max(100),
  deskripsi: Joi.string().required(),
  harga: Joi.number().required().min(0),
  lokasi: Joi.string().required(),
  kondisi: Joi.string()
    .required()
    .valid("baru", "seperti baru", "bekas", "rusak ringan"),
});

// Barang update validation schema
const updateBarangSchema = Joi.object({
  kategori_id: Joi.number(),
  judul: Joi.string().min(5).max(100),
  deskripsi: Joi.string(),
  harga: Joi.number().min(0),
  lokasi: Joi.string(),
  kondisi: Joi.string().valid("baru", "seperti baru", "bekas", "rusak ringan"),
  status: Joi.string().valid("tersedia", "terjual", "dipesan"),
});

// Transaksi creation validation schema
const createTransaksiSchema = Joi.object({
  barang_id: Joi.number().required(),
  metode_pembayaran: Joi.string().required(),
  catatan: Joi.string().allow("", null),
});

// Rating creation validation schema
const createRatingSchema = Joi.object({
  transaksi_id: Joi.number().required(),
  nilai: Joi.number().required().min(1).max(5),
  review: Joi.string().allow("", null),
});

// Chat validation schema
const chatSchema = Joi.object({
  receiver_id: Joi.number().required(),
  barang_id: Joi.number().required(),
  pesan: Joi.string().required(),
});

// Laporan validation schema
const laporanSchema = Joi.object({
  item_type: Joi.string().required().valid("barang", "pengguna"),
  reported_item_id: Joi.number().required(),
  alasan: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updatePasswordSchema,
  createBarangSchema,
  updateBarangSchema,
  createTransaksiSchema,
  createRatingSchema,
  chatSchema,
  laporanSchema,
};
