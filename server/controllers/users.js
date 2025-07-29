import Student from '../models/student.js';
import { Teacher } from '../models/teacher.js';
import { get_token, compareHash } from '../services/authentication.service.js';
import { getCachedUserStats, calculateUserStats } from '../events/user_stats.js';

export async function createAccount(req, res) {
  try {
    const userData = req.body;

    let user;
    if (userData.type === "Student") {
      user = new Student(userData);
    } else if (userData.type === "Teacher") {
      user = new Teacher(userData);
    } else {
      return res.status(400).json({ error: "Invalid user type." });
    }

    await user.save();
    return res.status(201).json({ message: "Account created successfully!" });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const { isMatch, id } = await compareHash(password, email, "User");
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = await get_token(id, "User");
    if (!token) {
      return res.status(500).json({ error: "Failed to generate token." });
    }

    return res.status(200).json({ message: "Login successful!", token });
  } catch (err) {
    return res.status(500).json({ error: "Login failed.", details: err.message });
  }
}

export async function stats(req, res) {
  try {
    const cachedStats = getCachedUserStats();
    const stats = cachedStats || await calculateUserStats();
    return res.status(200).json(stats);
  } catch (err) {
    return res.status(500).json({ error: "Failed to retrieve user stats.", details: err.message });
  }
}
