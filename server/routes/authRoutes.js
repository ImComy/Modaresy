import express from "express";
import {
  createAccount,
  login,
  sendVerificationCode,
  verifyEmail,
  getProfile,
  updateProfile,
  logout
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/auth.js";
import { registerLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/createAccount", registerLimiter, createAccount);
router.post("/login", registerLimiter, login);
router.post("/sendVerificationCode", verifyToken, registerLimiter, sendVerificationCode);
router.post("/verifyEmail", verifyToken, registerLimiter, verifyEmail);
router.get("/profile", verifyToken, getProfile);
router.put("/updateProfile", verifyToken, updateProfile);
router.delete("/logout", verifyToken, logout);

export default router;
