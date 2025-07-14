// Modules
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';

// Models
import User from '../models/user.js'

// Constants
const saltRounds = parseInt(process.env.saltRounds);

// Functions
export async function hash_password(plain_password) {
  try {
    const hash = await bcrypt.hash(plain_password, saltRounds)
    return hash;
  } catch (err) {
    console.error("Error hashing password:", err);
    return false;
  }
}
export async function compareHash(password, hashed_password) {
    return await bcrypt.compare(password, hashed_password)
}

export async function sendVerificationCode(body) {
  const { email, type } = body;
  
  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  const codeExpiresAt = new Date(Date.now() + 5 *60 *1000) // 5 minutes

  const user = await User.findOne({ email, __t: type, verified: false});

  if (!user) return {error: "User not found or already verified"}, {status: 404};

  user.verificationCode = verificationCode;
  user.codeExpiresAt = codeExpiresAt;

  await user.save();

  // add your whatsapp messaging api here

  return {message: "Verification code sent"}, {status: 200}; 
}

export async function verifyEmail(req, res) {
  const { phone_number, code } = req.body;

  const user = await User.findOne({ phone_number });

  if (!user) return { error: "User not found"}, {status: 404};
  if (user.verified) return res.status(400).json({ error: "Already verified" });

  if (user.verificationCode === code && user.codeExpiresAt > Date.now()) {
    user.verificationCode = null;
    user.codeExpiresAt = null;
    user.verified = true
    await user.save();

    return { message: "phone number verified successfully" }, {status: 200};
  }else{
    return { error: "Invalid or expired code" }, {status: 400};
  }
}

export function get_token(user){
 return jwt.sign({id: user._id, type: user.__t}, process.env.JWT_PRIVATE_KEY, {expiresIn: "30d"})
}