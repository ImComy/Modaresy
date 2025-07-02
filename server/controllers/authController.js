import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import { Student } from "../models/student.js";
import { Teacher } from "../models/teacher.js";
import { User } from "../models/user.js";

const saltRounds = parseInt(process.env.saltRounds);

async function hash_password(plain_password) {
  try {
    const hash = await bcrypt.hash(plain_password, saltRounds)
    return hash;
  } catch (err) {
    console.error("Error hashing password:", err);
    return false;
  }
}

export async function createAccount(req, res) {
  try{
    const body = req.body
    const { type } = body;
    const hashed_password = await hash_password(body.password)

    if (!hashed_password) {
      return res.status(500).json({ error: "Password hashing failed" });
    }

    body.password = hashed_password

    let user;
    if (type === "Student") {
      user = new Student(body);
    } else if (type === "Teacher") {
      user = new Teacher(body);
    }else{
      return res.status(400).json({ error: "Invalid user type" });
    }

    await user.save();
    return res.status(201).json({ message: "Account created!" });
  }catch(err){
    console.error(err);

    return res.status(400).json({ error: err.message });
  }
}

export async function sendVerificationCode(req, res) {
  const { email, type } = req.body;
  
  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  const codeExpiresAt = new Date(Date.now() + 5 *60 *1000) // 5 minutes

  const user = await User.findOne({ email, __t: type });

  if (!user) return res.status(404).json({ error: "User not found" });

  user.verificationCode = verificationCode;
  user.codeExpiresAt = codeExpiresAt;
  user.verified = false;
  await user.save();

  // add your sms/email api here

  return res.status(200).json({ message: "Verification code sent"}); 
}

export async function verifyEmail(req, res) {
  const { email, code } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.verified) return res.status(400).json({ error: "Already verified" });

  if (user.verificationCode === code && user.codeExpiresAt > Date.now()) {
    user.verificationCode = null;
    user.codeExpiresAt = null;
    user.verified = true
    await user.save();
    return res.json({ message: "email verified successfully" });
  }else{
    return res.status(400).json({ error: "Invalid or expired code" });
  }
}

export async function login(req, res) {
  const { email, password, type } = req.body
  const user = await User.findOne({email, __t: type})

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  if (!user.verified) {
    return res.status(403).json({ error: "Email not verified" });
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
}

export async function getProfile(req, res) {
  res.status(200).json({ user: req.user });
}

export async function updateProfile(req, res) {
  try {
    const updates = req.body;
    Object.assign(req.user, updates);
    await req.user.save();
    res.status(200).json({ message: "Profile updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export function logout(req, res) {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
}