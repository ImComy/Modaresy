import express from "express";
import mongoose from 'mongoose';
import bcrypt from 'bcrypt'
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import JWT from 'jsonwebtoken'
import {Student, Teacher} from './user_types.js'

dotenv.config();
await mongoose.connect('mongodb://localhost:27017/eduDB')
.then(() => console.log("Database Connected!"))
.catch(err => console.error("Connection error:", err));

const saltRounds = parseInt(process.env.saltRounds);
const router = express.Router();

async function hash_password(plain_password) {
  try {
    const hash = await bcrypt.hash(plain_password, saltRounds)
    return hash;
  } catch (err) {
    console.error("Error hashing password:", err);
    return false;
  }
}

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests
  message: 'Too many accounts created from this IP, please try again later'
});

router.post("/createAccount", registerLimiter, async (req, res) => {
  try{
    const body = req.body
    const hashed_password = await hash_password(body.password)

    if (!hashed_password) {
      return res.status(500).json({ error: "Password hashing failed" });
    }

    body.password = hashed_password

    let user;
    if (body.type === "Student") {
      user = new Student(body);
    } else if (body.type === "Teacher") {
      user = new Teacher(body);
    } else {
      return res.status(400).json({ error: "Invalid user type" });
    }

    await user.save();
    return res.status(201).json({ message: "Account created!" });
  }catch(err){
    console.error(err);

    return res.status(400).json({ error: err.message });
  }
});
router.post("/sendVerificationCode", async (req, res) => {
  const { phone_number } = req.body;
  
  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  const codeExpiresAt = new Date(Date.now() + 5 *60 *1000) // 5 minutes

  await Student.updateOne({ phone_number }, {
    verificationCode,
    codeExpiresAt,
    verified: false
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  // send the sms/email api

})
router.post("/verifyPhone", async (req, res) => {
  const { phone_number, code } = req.body;

  const user = await Student.findOne({ phone_number });

  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.verified) return res.status(400).json({ error: "Already verified" });

  if (user.verificationCode === code && user.codeExpiresAt > Date.now()) {
    user.verified = true;
    user.verificationCode = null;
    user.codeExpiresAt = null;
    await user.save();
    return res.json({ message: "Phone number verified successfully" });
  }

  res.status(400).json({ error: "Invalid or expired code" });
});

router.post("/login", registerLimiter, async (req, res) => {
  const { email, password, type } = req.body
  let user;

  if (type == "Student"){
    user = await Student.findOne({type, email});
  }else if(type == "Teacher"){
    user = await Teacher.findOne({type, email});
  }else{
    return res.status(400).json({error: "Invalid user type!"})
  }
  if (!user){
    return res.status(404).json({error: "User not found!"})
  }

  const match = await bcrypt.compare(password, user.password)

  if (match){
    const token = JWT.sign({id: user._id, type: user.type}, process.env.JWT_PRIVATE_KEY, {expiresIn: "30d"})
    // update the user to add the "last session date"
    res.status(201).json({token})
  }else{
    return res.status(400).json({ error: "Password is invalid" });
  }
})
router.get("/profile", (req, res) => {
  
})
router.put("/updateProfile", (req, res) => {
  
})
router.delete("/logout", (req, res) => {
  
})

export default router;
