const User = require("./User");
const Kategori = require("./Kategori");
const Barang = require("./Barang");
const Wishlist = require("./Wishlist");
const Transaksi = require("./Transaksi");
const Rating = require("./Rating");
const Chat = require("./Chat");
const Laporan = require("./Laporan");
const Notifikasi = require("./Notifikasi");

// Define additional associations

// User associations
User.hasMany(Barang, { foreignKey: "user_id" });
User.hasMany(Wishlist, { foreignKey: "user_id" });
User.hasMany(Transaksi, { as: "seller", foreignKey: "seller_id" });
User.hasMany(Transaksi, { as: "buyer", foreignKey: "buyer_id" });
User.hasMany(Rating, { as: "reviewer", foreignKey: "reviewer_id" });
User.hasMany(Rating, { as: "reviewed", foreignKey: "reviewed_id" });
User.hasMany(Chat, { as: "sender", foreignKey: "sender_id" });
User.hasMany(Chat, { as: "receiver", foreignKey: "receiver_id" });
User.hasMany(Laporan, { as: "reporter", foreignKey: "reporter_id" });
User.hasMany(Notifikasi, { foreignKey: "user_id" });

// Kategori associations
Kategori.hasMany(Barang, { foreignKey: "kategori_id" });

// Barang associations
Barang.hasOne(Transaksi, { foreignKey: "barang_id" });
Barang.hasMany(Wishlist, { foreignKey: "barang_id" });
Barang.hasMany(Chat, { foreignKey: "barang_id" });

// Transaksi associations
Transaksi.hasOne(Rating, { foreignKey: "transaksi_id" });

module.exports = {
  User,
  Kategori,
  Barang,
  Wishlist,
  Transaksi,
  Rating,
  Chat,
  Laporan,
  Notifikasi,
};
