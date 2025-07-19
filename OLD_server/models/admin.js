import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true // allow some accounts to use username only
  },
  password: {
    type: String,
    required: true
  }
});

export const Admin = mongoose.model("Admin", AdminSchema);
