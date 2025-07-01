import JWT from 'jsonwebtoken';
import { User } from "../models/user.js";

export async function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = JWT.verify(token, process.env.JWT_PRIVATE_KEY);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.__t !== decoded.type) return res.status(403).json({ error: 'User type mismatch' });

    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}
