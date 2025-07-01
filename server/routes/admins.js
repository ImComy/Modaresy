import express from "express";
const router = express.Router();

router.get("/login", (req, res) => {
  console.log(req.body)
  res.json({ message: "Hello from Express!" });
});
router.post("/addTutor", (req, res) => {

})
router.delete("/removeStudent", (req, res) => {

})
router.delete("/removeTutor", (req, res) => {

})
router.put("/updateStudent", (req, res) => {

})
router.put("/updateTutor", (req, res) => {

})
router.get("/loadAnalysis/:adminToken", (req, res) => {

})

export default router;