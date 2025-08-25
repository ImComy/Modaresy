import express from "express";
import multer from 'multer';
import path from "path";

import { 
    verifyToken
} from "../services/authentication.service.js";

const router = express.Router();
//router.use(verifyToken)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({storage})

router.post("/uploadImage", upload.single("profile_picture"), (req, res) => {
  try {
    return res.status(200).json({path: req.file.destination, originalname: req.file.originalname, filename: req.file.filename})
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});


export default router;
