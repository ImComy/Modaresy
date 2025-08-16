import express from "express";
import { verifyToken } from '../services/authentication.service.js';
import { isTeacher, getTeacherbyId, getEnrollmentRequest } from '../services/tutor.service.js';
import { getProfile, updateProfile, getTutors, getTutor, acceptEnrollment, rejectEnrollment, populateAvailability } from '../controllers/tutor.js';
import { getStudentById } from '../services/student.service.js';

const router = express.Router();

// Tutor listings
router.get("/loadTutors/:pages/:limit", getTutors);

// Single tutor
router.get("/loadTutor/:tutorId", getTeacherbyId, getTutor);

// Profile management
router.get("/getProfile", verifyToken, isTeacher, getProfile, populateAvailability);
router.put("/updateProfile", verifyToken, isTeacher, updateProfile, populateAvailability);

// Enrollment actions
router.post("/acceptEnrollment", verifyToken, isTeacher, getStudentById, getEnrollmentRequest, acceptEnrollment);
router.delete("/rejectEnrollment", verifyToken, isTeacher, getStudentById, getEnrollmentRequest, rejectEnrollment);

export default router;