const { User } = require("../models");
const { hashPassword } = require("../utils/auth");

/**
 * Seed an admin user to the database
 * Can be run standalone with: node seeders/adminSeeder.js
 * Or can be imported as a module
 */
const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { role: "admin" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists!");
      return;
    }

    // Admin user data
    const adminData = {
      nama: "Super Admin",
      email: process.env.ADMIN_EMAIL || "admin@marketplace.com",
      password: await hashPassword(
        process.env.ADMIN_PASSWORD || "admin123_strong"
      ),
      nomor_telepon: "081234567890",
      alamat: "Jl. Admin No. 1",
      kampus: "Universitas Admin",
      role: "admin",
      status_akun: "aktif",
    };

    // Create admin user
    const admin = await User.create(adminData);
    console.log("Admin user created successfully:", admin.email);
    return admin;
  } catch (error) {
    console.error("Error seeding admin user:", error);
    throw error;
  }
};

// If this script is run directly, execute the seeder and exit
if (require.main === module) {
  seedAdmin()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error running admin seeder:", error);
      process.exit(1);
    });
}

// Export the seeder function for use as a module
module.exports = seedAdmin;
