const readline = require("readline");
const { User } = require("../models");
const { hashPassword } = require("../utils/auth");
const { sequelize } = require("../config/database");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Command line script to create an admin user
 * Run with: node scripts/createAdmin.js
 */
const promptAdminDetails = () => {
  const adminData = {};

  rl.question("Admin Name: ", (nama) => {
    adminData.nama = nama;

    rl.question("Admin Email: ", (email) => {
      adminData.email = email;

      rl.question("Admin Password: ", async (password) => {
        adminData.password = password;

        rl.question("Phone Number: ", (nomor_telepon) => {
          adminData.nomor_telepon = nomor_telepon;

          rl.question("Address: ", (alamat) => {
            adminData.alamat = alamat;

            rl.question("Campus: ", async (kampus) => {
              adminData.kampus = kampus;

              try {
                // Check if admin email already exists
                const existingUser = await User.findOne({
                  where: { email: adminData.email },
                });

                if (existingUser) {
                  console.log(
                    `User with email ${adminData.email} already exists!`
                  );
                  rl.close();
                  return;
                }

                // Hash password before saving
                const hashedPassword = await hashPassword(adminData.password);

                // Create admin user
                const admin = await User.create({
                  nama: adminData.nama,
                  email: adminData.email,
                  password: hashedPassword,
                  nomor_telepon: adminData.nomor_telepon,
                  alamat: adminData.alamat,
                  kampus: adminData.kampus,
                  role: "admin",
                  status_akun: "aktif",
                });

                console.log(
                  `Admin user created successfully with ID: ${admin.user_id}`
                );
              } catch (error) {
                console.error("Error creating admin:", error);
              } finally {
                await sequelize.close();
                rl.close();
              }
            });
          });
        });
      });
    });
  });
};

console.log("=== Create Admin User ===");
promptAdminDetails();
