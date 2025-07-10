import JWT from 'jsonwebtoken';
import { User } from "../models/user.js";
import { Admin } from "../models/admin.js";

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

export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.admin_token;

    if (!token)
      return res.status(401).json({ error: "Admin token not found in cookies" });

    const decoded = JWT.verify(token, process.env.JWT_PRIVATE_KEY);

    if (!decoded || decoded.type !== "Admin")
      return res.status(403).json({ error: "Unauthorized: Not an admin token" });

    const admin = await Admin.findById(decoded.adminId);
    if (!admin)
      return res.status(401).json({ error: "Admin no longer exists" });

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token", details: err.message });
  }
};
