import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { Admin } from "../models/admin.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const seedAdmin = async () => {
  const adminAccounts = [
    {
      username: "superadmin",
      email: "admin@example.com",
      password: "admin1234"
    },
    {
      username: "backupadmin",
      password: "backup1234"
    }
  ];

  for (const account of adminAccounts) {
    const existing = await Admin.findOne({
      $or: [
        { username: account.username },
        { email: account.email }
      ]
    });

    if (existing) {
      console.log(`⚠️ Admin '${account.username}' already exists.`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(account.password, 10);
    const newAdmin = new Admin({
      username: account.username,
      email: account.email,
      password: hashedPassword
    });

    await newAdmin.save();
    console.log(`✅ Created admin: ${account.username}`);
  }

  mongoose.connection.close();
};

seedAdmin();
