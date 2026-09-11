require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || "Administrator";

    if (!adminEmail || !adminPassword) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD must be provided"
      );
    }

    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      existingAdmin.role = "admin";
      existingAdmin.name = adminName;

      if (adminPassword) {
        existingAdmin.password = await bcrypt.hash(
          adminPassword,
          10
        );
      }

      await existingAdmin.save();

      console.log("Existing user promoted to admin");
    } else {
      const hashedPassword = await bcrypt.hash(
        adminPassword,
        10
      );

      await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });

      console.log("Admin user created successfully");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(
      "Failed to create admin:",
      error.message
    );

    process.exit(1);
  }
};

createAdmin();