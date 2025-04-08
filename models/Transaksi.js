const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");
const Barang = require("./Barang");

const Transaksi = sequelize.define(
  "Transaksi",
  {
    transaksi_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    barang_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Barang,
        key: "barang_id",
      },
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    buyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    tanggal_transaksi: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    metode_pembayaran: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    total_harga: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: [
          [
            "pending",
            "dibayar",
            "diproses",
            "dikirim",
            "selesai",
            "dibatalkan",
          ],
        ],
      },
    },
    catatan: {
      type: DataTypes.TEXT,
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
    tableName: "TRANSAKSI",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Define associations
Transaksi.belongsTo(Barang, { foreignKey: "barang_id" });
Transaksi.belongsTo(User, { as: "seller", foreignKey: "seller_id" });
Transaksi.belongsTo(User, { as: "buyer", foreignKey: "buyer_id" });

module.exports = Transaksi;
