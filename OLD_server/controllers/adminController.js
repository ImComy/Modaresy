// controllers/adminController.js
import { Admin } from "../models/admin.js";
import { Teacher } from "../models/teacher.js";
import { Student } from "../models/student.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// GET /admin/login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

const token = jwt.sign(
  { adminId: admin._id, type: "Admin" },
  process.env.JWT_PRIVATE_KEY,
  { expiresIn: "7d" }
);

res.cookie("admin_token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  sameSite: "Strict"
});

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};

// POST /admin/addTutor
export const addTutor = async (req, res) => {
  try {
    const { teacherData } = req.body;
    const newTeacher = new Teacher(teacherData);
    await newTeacher.save();
    res.status(201).json({ message: "Tutor added", teacher: newTeacher });
  } catch (err) {
    res.status(500).json({ error: "Failed to add tutor", details: err.message });
  }
};

// DELETE /admin/removeStudent
export const removeStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const deleted = await Student.findByIdAndDelete(studentId);
    if (!deleted) return res.status(404).json({ error: "Student not found" });
    res.status(200).json({ message: "Student removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove student", details: err.message });
  }
};

// DELETE /admin/removeTutor
export const removeTutor = async (req, res) => {
  try {
    const { tutorId } = req.body;
    const deleted = await Teacher.findByIdAndDelete(tutorId);
    if (!deleted) return res.status(404).json({ error: "Tutor not found" });
    res.status(200).json({ message: "Tutor removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove tutor", details: err.message });
  }
};

// PUT /admin/updateStudent
export const updateStudent = async (req, res) => {
  try {
    const { studentId, updates } = req.body;
    const updated = await Student.findByIdAndUpdate(studentId, updates, { new: true });
    if (!updated) return res.status(404).json({ error: "Student not found" });
    res.status(200).json({ message: "Student updated", student: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update student", details: err.message });
  }
};

// PUT /admin/updateTutor
export const updateTutor = async (req, res) => {
  try {
    const { tutorId, updates } = req.body;
    const updated = await Teacher.findByIdAndUpdate(tutorId, updates, { new: true });
    if (!updated) return res.status(404).json({ error: "Tutor not found" });
    res.status(200).json({ message: "Tutor updated", tutor: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update tutor", details: err.message });
  }
};

// GET /admin/loadAnalysis/:adminToken
export const loadAnalysis = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      stats: {
        students: totalStudents,
        teachers: totalTeachers,
        totalUsers
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load analysis", details: err.message });
  }
};
