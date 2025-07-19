import express from "express";
import { 
    verifyAdmin,
    rateLimiter,
    hash_password
 } from "../services/authentication.service";
import {
    login,
    removeStudent,
    removeTutor,
    updateStudent,
    updateTutor
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
//router.put("/updateStudent", verifyAdmin, updateStudent)
//router.put("/updateTutor", verifyAdmin, updateTutor)
//router.get("/loadAnalysis/:adminToken", verifyAdmin, loadAnalysis)

export default router;