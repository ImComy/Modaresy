import express from "express";
import { 
    verifyAdmin,
    rateLimiter,
    hash_password
 } from "../services/authentication.service.js";
import {
    login,
    removeStudent,
    removeTutor,
    updateStudent,
    updateTutor,
    rejectReview,
    approveReview,
    loadPendingReviews
} from "../controllers/admin.js"
import {
    createNewTutor,
    getTeacherbyId
} from "../services/tutor.service.js";
import { getStudentById } from "../services/student.service.js";

const router = express.Router();
router.use(rateLimiter);

router.post("/login", login)
router.post("/addTutor", verifyAdmin, hash_password, createNewTutor)
router.delete("/removeStudent", verifyAdmin, getStudentById, removeStudent)
router.delete("/removeTutor", verifyAdmin, getTeacherbyId, removeTutor)
router.get("/loadPendingReviews", verifyAdmin, loadPendingReviews)
router.post("/approveReview", verifyAdmin, approveReview)
router.delete("/rejectReview", verifyAdmin, rejectReview)
//router.put("/updateStudent", verifyAdmin, updateStudent)
//router.put("/updateTutor", verifyAdmin, updateTutor)
//router.get("/loadAnalysis/:adminToken", verifyAdmin, loadAnalysis)

export default router;