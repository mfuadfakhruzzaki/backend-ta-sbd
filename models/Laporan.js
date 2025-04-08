const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");

const Laporan = sequelize.define(
  "Laporan",
  {
    laporan_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    reporter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    item_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [["barang", "pengguna"]],
      },
    },
    reported_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    alasan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: [["pending", "diproses", "selesai", "ditolak"]],
      },
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
    tableName: "LAPORAN",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Define associations
Laporan.belongsTo(User, { as: "reporter", foreignKey: "reporter_id" });

module.exports = Laporan;
