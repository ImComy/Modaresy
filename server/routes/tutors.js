import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { registerLimiter } from "../middleware/rateLimit.js";
import { User } from "../models/user.js";
import { SubjectProfile, Subject } from "../models/subject.js";
import mongoose from "mongoose";

const router = express.Router();


router.get("/loadTutors", (req, res) => {

})
router.get("/loadTutorsFiltered/:Grade/:Sector/:Language/:Governate/:MinimumRating/:MinMonthlyRange/:MaxMonthlyRange", (req, res) => {

})
router.get("/getTopTutorsFiltered/:Grade/:Sector/:Langauge", (req, res) => {

})
router.get("/getTopTutors/:Grade/:Sector/:Langauge", (req, res) => {
    
})
router.get("/loadTutor/:tutorID", async (req, res) => {
    try {
        const { tutorID } = req.params
        if (!mongoose.Types.ObjectId.isValid(tutorID)) {
            return res.status(404).json({ error: "Invalid tutor ID format" });
        }     
        const Teacher = await User.findById(tutorID)

        if (Teacher) {
            delete Teacher.password;
            delete Teacher.verificationCode;
            delete Teacher.codeExpiresAt;
            delete Teacher.last_login;
            Teacher.profiles = []

            if (Teacher.subject_profiles){
                for (let i = 0; i < Teacher.subject_profiles; i+=1){
                    const my_profile = await SubjectProfile.findOne({_id: Teacher.subject_profiles[i]}).toObject();
                    const my_subject = await Subject.findOne({_id: my_profile.subject_id}).toObject();

                    my_profile.subject = my_subject
                    delete my_subject.subject_id
                    profiles.push(my_profile)
                }
            }
            
            return res.status(200).json(Teacher)
        } else {
            return res.status(404).json({ warn: "User not found" })
        }
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
})
router.get("/loadDashboard/:token", (req, res) => {

})

export default router;