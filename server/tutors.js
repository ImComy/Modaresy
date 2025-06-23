import express from "express";
const router = express.Router();

router.get("/loadTutors", (req, res) => {

})
router.get("/loadTutorsFiltered/:Grade/:Sector/:Language/:Location/:MinimumRating/:MinMonthlyRange/:MaxMonthlyRange", (req, res) => {

})
router.get("/getTopTutorsFiltered/:Grade/:Sector/:Langauge", (req, res) => {

})
router.get("/getTopTutors/:Grade/:Sector/:Langauge", (req, res) => {
    
})
router.get("/loadTutor/:tutorID", (req, res) => {

})
router.get("/loadDashboard/:token", (req, res) => {

})

export default router;