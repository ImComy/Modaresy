import express from "express";
import { verifyAdmin } from "../middleware/auth.js";
import { login, addTutor, removeStudent, removeTutor, updateStudent, updateTutor, loadAnalysis } from "../controllers/adminController.js"
const router = express.Router();

router.post("/login", login)
router.post("/addTutor", verifyAdmin, addTutor)
router.delete("/removeStudent", verifyAdmin, removeStudent)
router.delete("/removeTutor", verifyAdmin, removeTutor)
router.put("/updateStudent", verifyAdmin, updateStudent)
router.put("/updateTutor", verifyAdmin, updateTutor)
router.get("/loadAnalysis/:adminToken", verifyAdmin, loadAnalysis)

export default router;