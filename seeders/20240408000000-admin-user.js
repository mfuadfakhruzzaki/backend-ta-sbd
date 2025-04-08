"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash("Herazaki0201", 10);

    await queryInterface.bulkInsert(
      "Users",
      [
        {
          username: "admin",
          email: "admin@fuadfakhruz.id",
          password: hashedPassword,
          fullName: "Administrator",
          role: "admin",
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      "Users",
      { email: "admin@fuadfakhruz.id" },
      {}
    );
  },
};
