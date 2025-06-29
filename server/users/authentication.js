import express from "express";
import mongoose from 'mongoose';
import {UserSchema} from './user_types.js'

await mongoose.connect('mongodb://localhost:27017').then(() => console.log("Database Connected!"))

const router = express.Router();

router.post("/createAccount", (req, res) => {
  const body = req.body

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
