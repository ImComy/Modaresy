import express from "express";
import bcrypt from 'bcrypt'
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import JWT from 'jsonwebtoken'
import {Student, Teacher, User} from './user_types.js'

dotenv.config();

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
export async function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = JWT.verify(token, process.env.JWT_PRIVATE_KEY);
    const user = await User.findById(decoded.id)

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.__t !== decoded.type) {
      return res.status(403).json({ error: 'User type mismatch' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
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
  const user = await User.findOne({email, __t: type})

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const match = await bcrypt.compare(password, user.password)

  if (match){
    const token = JWT.sign({id: user._id, type: user.__t}, process.env.JWT_PRIVATE_KEY, {expiresIn: "30d"})
    
    user.latest_session = new Date();
    await user.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
    res.status(200).json({ message: "Logged in" })
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
