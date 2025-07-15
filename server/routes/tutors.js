import express from "express";

import {
  verifyToken
} from '../services/authentication.service.js'
import {
  isTeacher,
  getProfile,
  updateProfile
} from '../services/tutor.service.js'
import {
  getProfile,
  updateProfile
} from '../controllers/tutor.js'

const router = express.Router();

router.get("/loadTutors/:NumberOfResults/:Grade/:Sector/:Language/:Governate/:District/:MinimumRating/:MinMonthlyRange/:MaxMonthlyRange");

router.get("/loadTutor/:tutorID/:subjectProfileID");

router.get("/loadDashboard", verifyToken, isTeacher);

router.post("/reviewTutor", verifyToken, isTeacher)

router.get("/getProfile", isTeacher, getProfile)

router.put("/updateProfile", isTeacher, updateProfile)

export default router;

/*
const deepPopulateSubjectProfiles = {
  path: "subject_profiles",
  populate: [
    { path: "subject_id", model: "Subject" },
    { path: "private_pricing", model: "PrivatePricing" },
    { path: "offer_id", model: "Offer" },
    { path: "groups", model: "Group" },
    { path: "reviews", model: "Review", populate: { path: "User_ID", model: "User" } },
    { path: "additional_pricing", model: "AdditionalPricing" },
    { path: "youtube", model: "YouTubeLink" }
  ]
};
*/