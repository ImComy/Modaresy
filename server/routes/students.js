import express from "express";
import { 
    verifyToken
} from "../services/authentication.service.js";
import {
    getWishlist
} from "../services/student.service.js"
import {
    getTeacherById
} from '../services/tutor.service.js'

import { reviewTutor, contactTutor, addToWishlist, removeFromWishlist, reportTutor, getProfile, updateProfile} from "../controllers/studentController.js";

const router = express.Router();

router.use(verifyToken)

//router.post("/reviewTutor", reviewTutor)
router.post("/contactTutor", getTeacherById, contactTutor)
router.post("/addWishlist", getWishlist, addToWishlist)
router.delete("/removeWishlist", getWishlist, removeFromWishlist)
//router.post("/reportTutor", reportTutor)
router.get("/getProfile", getProfile)
router.put("/updateProfile", updateProfile)

export default router;
