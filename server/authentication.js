import express from "express";
const router = express.Router();

router.post("/createAccount", (req, res) => {
  console.log(req.body)
  res.json({ message: "Hello from Express!" });
});
router.get("/login/:email/:password", (req, res) => {
  
})
router.get("/profile", (req, res) => {
  
})
router.put("/updateProfile", (req, res) => {
  
})
router.delete("/logout", (req, res) => {
  
})

export default router;
