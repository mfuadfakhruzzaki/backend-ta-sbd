const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");
const Transaksi = require("./Transaksi");

const Rating = sequelize.define(
  "Rating",
  {
    rating_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    transaksi_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: Transaksi,
        key: "transaksi_id",
      },
    },
    reviewer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    reviewed_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    nilai: {
      type: DataTypes.INTEGER(2),
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    review: {
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
    tableName: "RATING",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Define associations
Rating.belongsTo(Transaksi, { foreignKey: "transaksi_id" });
Rating.belongsTo(User, { as: "reviewer", foreignKey: "reviewer_id" });
Rating.belongsTo(User, { as: "reviewed", foreignKey: "reviewed_id" });

module.exports = Rating;
