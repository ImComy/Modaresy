import express from "express";
import { SubjectController } from "../controllers/subjects.js";
import { verifyToken, isAdmin } from "../services/authentication.service.js";
import { isStudent } from "../services/student.service.js";
import { isTeacher } from "../services/tutor.service.js";

const router = express.Router();

// Base subjects
router.post("/subjects", verifyToken, isTeacher, SubjectController.createSubject);
router.get("/subjects/:id", verifyToken, isTeacher, SubjectController.getSubject);
router.put("/subjects/:id", verifyToken, isTeacher, SubjectController.updateSubject);
router.delete("/subjects/:id", verifyToken, isTeacher, SubjectController.deleteSubject);

// Profiles
router.post("/profiles", verifyToken, SubjectController.createProfile);
router.get("/profiles/:id", verifyToken, SubjectController.getProfile);
router.put("/profiles/:id", verifyToken, isTeacher, SubjectController.updateProfile);
router.delete("/profiles/:id", verifyToken, isTeacher, SubjectController.deleteProfile);

// Public
router.get("/loadall", verifyToken, SubjectController.getAllSubjectsPublic);
router.get("/load/:tutorId", SubjectController.getSubjectsForTutor);
router.put("/update", verifyToken, isTeacher, SubjectController.updateAny);

// Reviews
router.post("/reviews", verifyToken, isStudent, SubjectController.createReview);
router.put("/reviews/:id", verifyToken, isStudent, SubjectController.updateReview);
router.delete("/reviews/:id", verifyToken, isStudent, SubjectController.deleteReview);
router.get("/profiles/:profileId/reviews", verifyToken, SubjectController.getProfileReviews); 

export default router;
