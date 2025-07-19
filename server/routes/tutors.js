import express from "express";

import {
  verifyToken
} from '../services/authentication.service.js'
import {
  validateSubjectProfile
} from '../services/validation.service.js'
import {
  isTeacher,
  getSubjectProfileReviews,
  get_subject_profile,
  get_subject_profiles,
  getTeacherbyId,
  getEnrollmentRequest
} from '../services/tutor.service.js'
import {
  getProfile,
  updateProfile,
  getTutors,
  getTutor,
  reviewTutor,
  acceptEnrollment,
  rejectEnrollment
} from '../controllers/tutor.js'
import {
  isStudent,
  isEnrolled,
  getStudentById
} from '../services/student.service.js'

const router = express.Router();

router.get("/loadTutors/:pages/:limit/:Grade/:Sector/:Language/:Governate/:District/:MinimumRating/:MinMonthlyRange/:MaxMonthlyRange", getTutors);

router.get("/loadTutor/:tutorID", getTeacherbyId, getTutor);

// query pages,limit
router.get("/loadTutorReviews/:subjectProfileID", getSubjectProfileReviews);

router.get("/loadSubjectProfile/:subjectProfileID", get_subject_profile);

router.get("/loadSubjectProfiles/:tutorID", getTeacherbyId, get_subject_profiles);

//router.get("/loadDashboard", verifyToken, isTeacher);

router.post("/reviewTutor", verifyToken, isStudent, getTeacherbyId, validateSubjectProfile, isEnrolled, reviewTutor)

router.get("/getProfile", isTeacher, getProfile)

router.put("/updateProfile", isTeacher, updateProfile)

router.post("/acceptEnrollment", verifyToken, isTeacher, getStudentById, getEnrollmentRequest, acceptEnrollment);

router.delete("/rejectEnrollment", verifyToken, isTeacher, getStudentById, getEnrollmentRequest, rejectEnrollment);

export default router;