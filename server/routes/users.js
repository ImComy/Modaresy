import express from "express";
import {
  createAccount,
  login
} from "../controllers/users.js";

import {
  rateLimiter,
  verifyToken,
  sendVerificationCode,
  verifyUserAccount,
  logout,
  hash_password,
  updatePassword
} from '../services/authentication.service.js';

const router = express.Router();

router.use(rateLimiter)

router.post("/createAccount", hash_password, createAccount);
router.post("/login", login);
router.post("/sendVerificationCode", verifyToken, sendVerificationCode);
router.post("/verifyUserAccount", verifyToken, verifyUserAccount);
router.post("/updatePassword", verifyToken, updatePassword);
router.delete("/logout", verifyToken, logout);

export default router;