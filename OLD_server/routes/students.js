import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { reviewTutor, contactTutor, addToWishlist, removeFromWishlist, reportTutor } from "../controllers/studentController.js";

const router = express.Router();

router.post("/reviewTutor", verifyToken, reviewTutor)
router.post("/contactTutor", verifyToken, contactTutor)
router.post("/addWishlist", verifyToken, addToWishlist)
router.delete("/removeWishlist", verifyToken, removeFromWishlist)
router.post("/reportTutor", verifyToken, reportTutor)

export default router;
