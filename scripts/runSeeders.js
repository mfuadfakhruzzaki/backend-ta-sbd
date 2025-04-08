const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { sequelize } = require("../config/database");

/**
 * Script to run all seeders in order
 * This is helpful for initializing the database with required data
 */
const runSeeders = async () => {
  console.log("=== Running Database Seeders ===");

  try {
    // Test database connection first
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Import seeders
    const adminSeeder = require("../seeders/adminSeeder");

    // Add more seeders here if needed, for example:
    // const categorySeeder = require('../seeders/categorySeeder');
    // const productSeeder = require('../seeders/productSeeder');

    // Run admin seeder
    console.log("Running admin seeder...");
    await adminSeeder();

    // Run additional seeders if needed
    // console.log('Running category seeder...');
    // await categorySeeder();

    console.log("=== All seeders completed successfully ===");
  } catch (error) {
    console.error("Error running seeders:", error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
};

// Run the seeders
runSeeders();
