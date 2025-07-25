import express from "express";
import { 
    verifyToken
} from "../services/authentication.service.js";
import {
    getWishlist
} from "../services/student.service.js"
import {
    getTeacherbyId
} from '../services/tutor.service.js'

import { 
    contactTutor, 
    addToWishlist, 
    removeFromWishlist, 
    //reportTutor, 
    getProfile, 
    updateProfile,
    requestEnrollment,
    isStudent
} from "../controllers/student.js";

const router = express.Router();

router.use(verifyToken)

router.post("/contactTutor", getTeacherbyId, contactTutor)
router.post("/requestEnrollment", getTeacherbyId, requestEnrollment)
router.post("/addWishlist", getWishlist, addToWishlist)
router.delete("/removeWishlist", getWishlist, removeFromWishlist)
//router.post("/reportTutor", reportTutor)

router.get("/getProfile", getProfile)
router.put("/updateProfile", updateProfile)

export default router;
