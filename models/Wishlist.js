const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");
const Barang = require("./Barang");

const Wishlist = sequelize.define(
  "Wishlist",
  {
    wishlist_id: {
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
    barang_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Barang,
        key: "barang_id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "WISHLIST",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "barang_id"],
      },
    ],
  }
);

// Define associations
Wishlist.belongsTo(User, { foreignKey: "user_id" });
Wishlist.belongsTo(Barang, { foreignKey: "barang_id" });

module.exports = Wishlist;
