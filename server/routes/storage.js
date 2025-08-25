import express from "express";
import multer from 'multer';
import path from "path";
import fs from "fs";
const fsp = fs.promises;

import { 
    verifyToken
} from "../services/authentication.service.js";

import { Teacher } from "../models/teacher.js";

const router = express.Router();

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({storage})

async function safeUnlink(filePath) {
  try {
    if (!filePath) return;
    const absolute = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    if (fs.existsSync(absolute)) await fsp.unlink(absolute);
  } catch (err) {
    console.error('safeUnlink error:', err.message);
  }
}

router.post("/uploadImage", upload.single("profile_picture"), (req, res) => {
  try {
    return res.status(200).json({path: req.file.destination, originalname: req.file.originalname, filename: req.file.filename})
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.post("/tutor/:tutorId/pfp", verifyToken, upload.single("profile_picture"), async (req, res) => {
  try {
    const { tutorId } = req.params;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const userId = String(req.user?._id || req.user?.id);
    if (String(userId) !== String(tutorId) && req.user?.type !== "Admin") {
      await safeUnlink(req.file.path);
      return res.status(403).json({ error: "Not authorized" });
    }

    const teacher = await Teacher.findById(tutorId);
    if (!teacher) {
      await safeUnlink(req.file.path);
      return res.status(404).json({ error: "Teacher not found" });
    }

    // remove old file if exists
    if (teacher.profile_picture && teacher.profile_picture.filename) {
      await safeUnlink(path.join(UPLOAD_DIR, teacher.profile_picture.filename));
    }

    teacher.profile_picture = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`
    };

    await teacher.save();
    return res.status(200).json({ message: "Profile picture updated", profile_picture: teacher.profile_picture });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/tutor/:tutorId/banner", verifyToken, upload.single("banner"), async (req, res) => {
  try {
    const { tutorId } = req.params;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const userId = String(req.user?._id || req.user?.id);
    if (String(userId) !== String(tutorId) && req.user?.type !== "Admin") {
      await safeUnlink(req.file.path);
      return res.status(403).json({ error: "Not authorized" });
    }

    const teacher = await Teacher.findById(tutorId);
    if (!teacher) {
      await safeUnlink(req.file.path);
      return res.status(404).json({ error: "Teacher not found" });
    }

    if (teacher.banner && teacher.banner.filename) {
      await safeUnlink(path.join(UPLOAD_DIR, teacher.banner.filename));
    }

    teacher.banner = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`
    };

    await teacher.save();
    return res.status(200).json({ message: "Banner updated", banner: teacher.banner });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/tutor/:tutorId/pfp", verifyToken, async (req, res) => {
  try {
    const { tutorId } = req.params;
    const userId = String(req.user?._id || req.user?.id);
    if (String(userId) !== String(tutorId) && req.user?.type !== "Admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const teacher = await Teacher.findById(tutorId);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    if (teacher.profile_picture && teacher.profile_picture.filename) {
      await safeUnlink(path.join(UPLOAD_DIR, teacher.profile_picture.filename));
    }

    teacher.profile_picture = null;
    await teacher.save();
    return res.status(200).json({ message: "Profile picture deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/tutor/:tutorId/banner", verifyToken, async (req, res) => {
  try {
    const { tutorId } = req.params;
    const userId = String(req.user?._id || req.user?.id);
    if (String(userId) !== String(tutorId) && req.user?.type !== "Admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const teacher = await Teacher.findById(tutorId);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    if (teacher.banner && teacher.banner.filename) {
      await safeUnlink(path.join(UPLOAD_DIR, teacher.banner.filename));
    }

    teacher.banner = null;
    await teacher.save();
    return res.status(200).json({ message: "Banner deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;