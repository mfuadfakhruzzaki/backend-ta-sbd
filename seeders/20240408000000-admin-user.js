"use strict";
const bcryptjs = require("bcryptjs");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcryptjs.hash("Herazaki0201", 10);

    await queryInterface.bulkInsert(
      "USER",
      [
        {
          nama: "Administrator",
          email: "admin@fuadfakhruz.id",
          password: hashedPassword,
          role: "admin",
          status_akun: "aktif",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      "USER",
      { email: "admin@fuadfakhruz.id" },
      {}
    );
  },
};
