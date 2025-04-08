const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");
const Kategori = require("./Kategori");

const Barang = sequelize.define(
  "Barang",
  {
    barang_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    kategori_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Kategori,
        key: "kategori_id",
      },
    },
    judul: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    foto: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const data = this.getDataValue("foto");
        return data ? JSON.parse(data) : [];
      },
      set(value) {
        this.setDataValue("foto", JSON.stringify(value));
      },
    },
    harga: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    lokasi: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    kondisi: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [["baru", "seperti baru", "bekas", "rusak ringan"]],
      },
    },
    views_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "tersedia",
      validate: {
        isIn: [["tersedia", "terjual", "dipesan"]],
      },
    },
    status_delete: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "BARANG",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    paranoid: true, // Enable soft delete
  }
);

// Define associations
Barang.belongsTo(User, { foreignKey: "user_id" });
Barang.belongsTo(Kategori, { foreignKey: "kategori_id" });

module.exports = Barang;
