import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import User from '../models/user.js';
import Admin from '../models/admin.js';

const saltRounds = parseInt(process.env.saltRounds);

export async function hash_password(req, res, next) {
  try {
    req.body.password = await bcrypt.hash(req.body.password, saltRounds);
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Error hashing password: ' + err.message });
  }
}

export async function compareHash(password, email, type = 'User') {
  const Model = type === 'Admin' ? Admin : User;
  const user = await Model.findOne({ email });
  if (!user) return false;

  const isMatch = await bcrypt.compare(password, user.password);
  return { isMatch, id: user._id };
}

export async function sendVerificationCode(req, res) {
  const { email, type } = req.body;

  const verificationCode = Math.floor(100000 + Math.random() * 900000);
  const codeExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  const user = await User.findOne({ email, __t: type, verified: false });
  if (!user) return res.status(404).json({ error: 'User not found or already verified' });

  user.verificationCode = verificationCode;
  user.codeExpiresAt = codeExpiresAt;
  await user.save();

  // Add WhatsApp messaging API integration here

  return res.status(200).json({ message: 'Verification code sent' });
}

export async function verifyUserAccount(req, res) {
  const { phone_number, code } = req.body;

  const user = await User.findOne({ phone_number });
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.verified) {
    return res.status(400).json({ error: 'Already verified' });
  }

  if (user.verificationCode === code && user.codeExpiresAt > Date.now()) {
    user.verificationCode = null;
    user.codeExpiresAt = null;
    user.verified = true;
    await user.save();

    return res.status(200).json({ message: 'Phone number verified successfully' });
  } else {
    return res.status(400).json({ error: 'Invalid or expired code' });
  }
}

export async function get_token(id, type = 'User') {
  const Model = type === 'Admin' ? Admin : User;
  const user = await Model.findById(id);
  if (!user) return false;

  const token = jwt.sign(
    { id: user._id, type: user.type },
    process.env.JWT_PRIVATE_KEY,
    { expiresIn: '30d' }
  );

  return token;
}

export async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, saltRounds);
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    return res.status(400).json({ error: 'Error updating password: ' + err.message });
  }
}

export function logout(req, res) {
  res.clearCookie('token');
  res.clearCookie('admin_token');
  res.status(200).json({ message: 'Logged out successfully' });
}

export async function verifyToken(req, res, next) {
  let token = req.cookies.token;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.type !== decoded.type) {
      return res.status(403).json({ error: 'User type mismatch' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.admin_token;
    if (!token) {
      return res.status(401).json({ error: 'Admin token not found in cookies' });
    }

    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    if (!decoded || decoded.type !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized: Not an admin token' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ error: 'Admin no longer exists' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token', details: err.message });
  }
};

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: 'Too many requests sent from this IP, please try again later',
});

export async function getProfileData(user) {
  let filtered_user = user;

  if (typeof user.toObject === 'function') {
    filtered_user = user.toObject();
  }

  delete filtered_user.password;
  delete filtered_user.verificationCode;
  delete filtered_user.codeExpiresAt;
  delete filtered_user.last_login;
  delete filtered_user.wishlist_id;

  return filtered_user;
}