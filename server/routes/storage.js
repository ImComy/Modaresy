import express from "express";
import multer from 'multer';
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const fsp = fs.promises;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { 
    verifyToken
} from "../services/authentication.service.js";

import { Teacher } from "../models/teacher.js";

const router = express.Router();

// Use a consistent path for uploads that works in both dev and production
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Ensure upload directory exists with proper permissions
const ensureUploadDir = async () => {
  try {
    await fsp.access(UPLOAD_DIR);
    console.log("Upload directory exists:", UPLOAD_DIR);
  } catch (err) {
    console.log("Upload directory doesn't exist, creating it...");
    try {
      // Create directory with read/write/execute permissions
      await fsp.mkdir(UPLOAD_DIR, { recursive: true });
      console.log("Upload directory created successfully at:", UPLOAD_DIR);
    } catch (mkdirErr) {
      console.error("Failed to create upload directory:", mkdirErr.message);
      throw new Error("Could not create upload directory");
    }
  }
};

// Initialize upload directory on server start
ensureUploadDir().catch(console.error);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await ensureUploadDir();
      cb(null, UPLOAD_DIR);
    } catch (err) {
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

async function safeUnlink(filePath) {
  try {
    if (!filePath) return;
    
    // Handle both absolute and relative paths
    let absolutePath;
    if (path.isAbsolute(filePath)) {
      absolutePath = filePath;
    } else {
      // If it's a relative path, check if it's relative to UPLOAD_DIR first
      absolutePath = path.join(UPLOAD_DIR, filePath);
    }
    
    if (fs.existsSync(absolutePath)) {
      await fsp.unlink(absolutePath);
      console.log("Successfully deleted file:", absolutePath);
    }
  } catch (err) {
    console.error('safeUnlink error:', err.message);
  }
}

// Simple upload endpoint for testing
router.post("/uploadImage", upload.single("profile_picture"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    // Return URL path instead of server path
    return res.status(200).json({
      filename: req.file.filename,
      originalname: req.file.originalname,
      url: `/uploads/${req.file.filename}`
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "File upload failed" });
  }
});

// Tutor profile picture upload
router.post("/tutor/:tutorId/pfp", verifyToken, upload.single("profile_picture"), async (req, res) => {
  try {
    const { tutorId } = req.params;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const userId = String(req.user?._id || req.user?.id);
    if (String(userId) !== String(tutorId) && req.user?.type !== "Admin") {
      await safeUnlink(req.file.filename);
      return res.status(403).json({ error: "Not authorized" });
    }

    const teacher = await Teacher.findById(tutorId);
    if (!teacher) {
      await safeUnlink(req.file.filename);
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Remove old file if exists
    if (teacher.profile_picture && teacher.profile_picture.filename) {
      await safeUnlink(teacher.profile_picture.filename);
    }

    teacher.profile_picture = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`
    };

    await teacher.save();
    return res.status(200).json({ 
      message: "Profile picture updated", 
      profile_picture: teacher.profile_picture 
    });
  } catch (err) {
    console.error("Profile picture upload error:", err);
    if (req.file) await safeUnlink(req.file.filename);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Tutor banner upload
router.post("/tutor/:tutorId/banner", verifyToken, upload.single("banner"), async (req, res) => {
  try {
    const { tutorId } = req.params;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const userId = String(req.user?._id || req.user?.id);
    if (String(userId) !== String(tutorId) && req.user?.type !== "Admin") {
      await safeUnlink(req.file.filename);
      return res.status(403).json({ error: "Not authorized" });
    }

    const teacher = await Teacher.findById(tutorId);
    if (!teacher) {
      await safeUnlink(req.file.filename);
      return res.status(404).json({ error: "Teacher not found" });
    }

    if (teacher.banner && teacher.banner.filename) {
      await safeUnlink(teacher.banner.filename);
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
    console.error("Banner upload error:", err);
    if (req.file) await safeUnlink(req.file.filename);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Delete profile picture
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
      await safeUnlink(teacher.profile_picture.filename);
    }

    teacher.profile_picture = null;
    await teacher.save();
    return res.status(200).json({ message: "Profile picture deleted" });
  } catch (err) {
    console.error("Delete profile picture error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Delete banner
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
      await safeUnlink(teacher.banner.filename);
    }

    teacher.banner = null;
    await teacher.save();
    return res.status(200).json({ message: "Banner deleted" });
  } catch (err) {
    console.error("Delete banner error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;