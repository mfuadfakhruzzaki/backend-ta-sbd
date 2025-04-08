const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");

const Notifikasi = sequelize.define(
  "Notifikasi",
  {
    notifikasi_id: {
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
    judul: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    pesan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    jenis: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [["transaksi", "chat", "sistem"]],
      },
    },
    is_read: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "NOTIFIKASI",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

// Define associations
Notifikasi.belongsTo(User, { foreignKey: "user_id" });

module.exports = Notifikasi;
