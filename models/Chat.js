const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");
const Barang = require("./Barang");

const Chat = sequelize.define(
  "Chat",
  {
    chat_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    barang_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Barang,
        key: "barang_id",
      },
    },
    pesan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status_dibaca: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0,
    },
    tanggal: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "CHAT",
    timestamps: false,
  }
);

// Define associations
Chat.belongsTo(User, { as: "sender", foreignKey: "sender_id" });
Chat.belongsTo(User, { as: "receiver", foreignKey: "receiver_id" });
Chat.belongsTo(Barang, { foreignKey: "barang_id" });

module.exports = Chat;
