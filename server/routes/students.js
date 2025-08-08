import express from "express";
import { 
    verifyToken
} from "../services/authentication.service.js";
import {
    getWishlist,
    hasWishlist,
    createWishlist
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
    getWishlistIds 
} from "../controllers/student.js";

const router = express.Router();

router.use(verifyToken)

router.get('/getProfile', verifyToken, getProfile);
router.put("/updateProfile", updateProfile)

router.use((req, res, next) => {
  if (!req.user || req.user.type !== 'Student') {
    return res.status(403).json({ error: 'Only students can use this feature' });
  }
  next();
});

router.post("/contactTutor", getTeacherbyId, contactTutor)
router.post("/requestEnrollment", getTeacherbyId, requestEnrollment)
router.post("/addToWishlist", getWishlist, addToWishlist)
router.delete("/removeFromWishlist", getWishlist, removeFromWishlist)
router.post("/createWishlist", hasWishlist, createWishlist);
router.get("/wishlist", getWishlist, getWishlistIds);
//router.post("/reportTutor", reportTutor)

export default router;
