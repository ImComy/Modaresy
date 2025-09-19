import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Storage } from "@google-cloud/storage";
import fs from "fs/promises";

import {
  verifyToken
} from "../services/authentication.service.js";

import { Teacher } from "../models/teacher.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

console.log("Initializing upload routes...");
console.log("Current directory:", __dirname);

// Read config from env
const {
  GOOGLE_CLOUD_PROJECT,
  GOOGLE_CREDENTIALS_FILENAME,
  GOOGLE_APPLICATION_CREDENTIALS,
  GOOGLE_APPLICATION_CREDENTIALS_JSON,
  GOOGLE_APPLICATION_CREDENTIALS_BASE64,
  GC_BUCKET_PFPS,
  GC_BUCKET_BANNERS,
  GC_BUCKET_UPLOADS,
  GCS_MAKE_PUBLIC = "true",
} = process.env;

// Normalize bucket env vars: strip surrounding single/double quotes if present
function normalizeBucketVal(v) {
  if (!v) return v;
  return v.replace(/^\s*['"]?|['"]?\s*$/g, '').trim();
}

const BUCKET_PFPS = normalizeBucketVal(GC_BUCKET_PFPS);
const BUCKET_BANNERS = normalizeBucketVal(GC_BUCKET_BANNERS);
const BUCKET_UPLOADS = normalizeBucketVal(GC_BUCKET_UPLOADS);

console.log('Configured BUCKETS:', {
  PFPS: BUCKET_PFPS,
  BANNERS: BUCKET_BANNERS,
  UPLOADS: BUCKET_UPLOADS,
  MAKE_PUBLIC: GCS_MAKE_PUBLIC
});

// Validate and build storage options safely. Do NOT call path.join on undefined values.
const storageOptions = {};
if (GOOGLE_CLOUD_PROJECT) storageOptions.projectId = GOOGLE_CLOUD_PROJECT;

// Attempt credential sources in order: JSON string -> base64 env -> file path -> legacy file
let credentialSource = null;
if (GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    storageOptions.credentials = JSON.parse(GOOGLE_APPLICATION_CREDENTIALS_JSON);
    credentialSource = 'GOOGLE_APPLICATION_CREDENTIALS_JSON';
    console.log('Using credentials from GOOGLE_APPLICATION_CREDENTIALS_JSON');
  } catch (err) {
    console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:', err.message);
  }
}

if (!storageOptions.credentials && GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
  try {
    const decoded = Buffer.from(GOOGLE_APPLICATION_CREDENTIALS_BASE64, 'base64').toString('utf8');
    storageOptions.credentials = JSON.parse(decoded);
    credentialSource = 'GOOGLE_APPLICATION_CREDENTIALS_BASE64';
    console.log('Using credentials from GOOGLE_APPLICATION_CREDENTIALS_BASE64');
  } catch (err) {
    console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS_BASE64:', err.message);
  }
}

if (!storageOptions.credentials && GOOGLE_APPLICATION_CREDENTIALS) {
  // Path provided directly (absolute or relative). If relative, resolve against repo.
  const credsPath = path.isAbsolute(GOOGLE_APPLICATION_CREDENTIALS)
    ? GOOGLE_APPLICATION_CREDENTIALS
    : path.join(__dirname, '..', GOOGLE_APPLICATION_CREDENTIALS);
  storageOptions.keyFilename = credsPath;
  credentialSource = 'GOOGLE_APPLICATION_CREDENTIALS (file)';
  console.log('Using credentials file from GOOGLE_APPLICATION_CREDENTIALS:', credsPath);
}

if (!storageOptions.credentials && !storageOptions.keyFilename && GOOGLE_CREDENTIALS_FILENAME) {
  // Old behavior: filename relative to server directory
  const credsPath = path.join(__dirname, '..', GOOGLE_CREDENTIALS_FILENAME);
  storageOptions.keyFilename = credsPath;
  credentialSource = 'GOOGLE_CREDENTIALS_FILENAME (file)';
  console.log('Using credentials file from GOOGLE_CREDENTIALS_FILENAME:', credsPath);
}

if (!storageOptions.credentials && !storageOptions.keyFilename) {
  // Try reading legacy base64 file at server/base64
  try {
    const base64Path = path.join(__dirname, '..', 'base64');
    const exists = await fs.stat(base64Path).then(() => true).catch(() => false);
    if (exists) {
      const b64 = await fs.readFile(base64Path, 'utf8');
      const decoded = Buffer.from(b64.trim(), 'base64').toString('utf8');
      storageOptions.credentials = JSON.parse(decoded);
      credentialSource = 'server/base64 file';
      console.log('Using credentials decoded from server/base64 file');
    } else {
      console.warn('No explicit Google credentials provided via env. Falling back to Application Default Credentials (ADC) if available.');
    }
  } catch (err) {
    console.error('Error reading/decoding server/base64 file:', err.message);
    console.warn('No explicit Google credentials provided via env. Falling back to Application Default Credentials (ADC) if available.');
  }
}

console.log('Credential source chosen:', credentialSource || 'none (ADC fallback)');

console.log('Env credential flags:', {
  hasJson: Boolean(GOOGLE_APPLICATION_CREDENTIALS_JSON),
  hasBase64: Boolean(GOOGLE_APPLICATION_CREDENTIALS_BASE64),
  hasFilePath: Boolean(GOOGLE_APPLICATION_CREDENTIALS || GOOGLE_CREDENTIALS_FILENAME)
});

// If credentials object is set (from JSON or base64), prefer it and ignore any keyFilename
if (storageOptions.credentials && storageOptions.keyFilename) {
  console.log('Credentials provided via env (JSON/base64); ignoring keyFilename to avoid file lookup.');
  delete storageOptions.keyFilename;
}

// If we have in-memory credentials (from JSON or base64), make sure the
// google-cloud library doesn't accidentally read process.env.GOOGLE_APPLICATION_CREDENTIALS
// (which would try to open a file). Clear those env vars when we're supplying
// credentials programmatically.
if (storageOptions.credentials) {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('Clearing process.env.GOOGLE_APPLICATION_CREDENTIALS to avoid file lookups (using in-memory credentials)');
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }
  if (process.env.GOOGLE_CREDENTIALS_FILENAME) {
    console.log('Clearing process.env.GOOGLE_CREDENTIALS_FILENAME to avoid file lookups (using in-memory credentials)');
    delete process.env.GOOGLE_CREDENTIALS_FILENAME;
  }
}

// If a keyFilename is set (file path), validate it exists before proceeding. If missing, drop it.
if (storageOptions.keyFilename) {
  try {
    await fs.stat(storageOptions.keyFilename);
  } catch (err) {
    console.warn('Specified keyFilename does not exist at path:', storageOptions.keyFilename, '- ignoring it.');
    delete storageOptions.keyFilename;
  }
}

console.log('Initializing GCS client with options:', Object.keys(storageOptions));
const storage = new Storage(storageOptions);

// Test GCS connection
async function testGCSConnection() {
  try {
    console.log("Testing GCS connection...");
    const [buckets] = await storage.getBuckets();
    console.log("GCS connection successful. Available buckets:", buckets.map(b => b.name));
    return true;
  } catch (error) {
    console.error("GCS connection failed:", error.message);
    return false;
  }
}

// Test connection on startup
testGCSConnection().then(isConnected => {
  if (isConnected) {
    console.log("GCS client initialized successfully");
  } else {
    console.error("GCS client initialization failed");
  }
});

// Middleware to parse multipart form data without multer
const handleMultipartForm = (req, res, next) => {
  console.log("Handling multipart form data");

  if (!req.headers['content-type'] || !req.headers['content-type'].startsWith('multipart/form-data')) {
    console.log("Request is not multipart form data");
    return next();
  }

  let body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  });

  req.on('end', () => {
    console.log("Finished receiving form data");
    next();
  });

  req.on('error', (err) => {
    console.error("Error receiving form data:", err);
    res.status(500).json({ error: "Error processing form data" });
  });
};

// Helpers
async function uploadBufferToGCS({ buffer, filename, destinationPath, contentType, bucketName }) {
  console.log(`Uploading to GCS - Bucket: ${bucketName}, Destination: ${destinationPath}, ContentType: ${contentType}`);

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(destinationPath);
  console.log(`GCS file object created: ${file.name}`);

  const streamOpts = { resumable: false, contentType, predefinedAcl: undefined };
  console.log("Stream options:", streamOpts);

  try {
    await file.save(buffer, streamOpts);
    console.log("File saved to GCS successfully");
  } catch (error) {
    console.error("Error saving file to GCS:", error);
    throw error;
  }

  if (String(GCS_MAKE_PUBLIC).toLowerCase() === "true") {
    try {
      console.log("Making file public...");
      await file.makePublic();
      console.log("File made public successfully");
    } catch (err) {
      console.warn("Failed to make file public:", err.message);
    }
  } else {
    console.log("Skipping makePublic (GCS_MAKE_PUBLIC is false)");
  }

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(destinationPath)}`;
  console.log("Generated public URL:", publicUrl);

  return {
    bucket: bucket.name,
    name: destinationPath,
    publicUrl,
  };
}

async function deleteFromGCS(bucketName, objectName) {
  console.log(`Deleting from GCS - Bucket: ${bucketName}, Object: ${objectName}`);

  try {
    if (!bucketName || !objectName) {
      console.log("Skipping delete - missing bucketName or objectName");
      return;
    }

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(objectName);

    const [exists] = await file.exists();
    if (!exists) {
      console.log("File does not exist, skipping delete");
      return true;
    }

    console.log("File exists, proceeding with delete");
    await file.delete({ ignoreNotFound: true });
    console.log("File deleted successfully");
    return true;
  } catch (err) {
    console.error("GCS delete error:", err);
    return false;
  }
}

function buildDestination({ typeFolder, tutorId, originalName }) {
  const ext = path.extname(originalName) || "";
  const base = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const destination = `${typeFolder}/${tutorId}/${base}${ext}`;

  console.log(`Built destination path: ${destination} for originalName: ${originalName}`);
  return destination;
}

async function generateSignedUrl(bucketName, fileName, contentType) {
  console.log(`Generating signed URL for bucket: ${bucketName}, file: ${fileName}`);

  const options = {
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000,
    contentType: contentType,
  };

  try {
    const [url] = await storage
      .bucket(bucketName)
      .file(fileName)
      .getSignedUrl(options);

    console.log("Generated signed URL:", url);
    return url;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
}

router.post("/generateUploadUrl", verifyToken, async (req, res) => {
  console.log("Generate upload URL endpoint called");
  console.log("Request body:", req.body);

  try {
    const { fileName, contentType, fileType } = req.body;

    if (!fileName || !contentType || !fileType) {
      console.log("Missing required parameters - returning 400");
      return res.status(400).json({ error: "fileName, contentType, and fileType are required" });
    }

    let bucketName;
    let folder;

    switch (fileType) {
      case 'pfp':
        bucketName = BUCKET_PFPS;
        folder = 'pfps';
        break;
      case 'banner':
        bucketName = BUCKET_BANNERS;
        folder = 'banners';
        break;
      case 'upload':
        bucketName = BUCKET_UPLOADS;
        folder = 'uploads';
        break;
      default:
        console.log("Invalid file type - returning 400");
        return res.status(400).json({ error: "Invalid fileType. Must be 'pfp', 'banner', or 'upload'" });
    }

    if (!bucketName) {
      console.log(`No ${fileType} bucket configured - returning 500`);
      return res.status(500).json({ error: `No ${fileType.toUpperCase()} bucket configured in .env` });
    }

    const tutorId = req.user._id || req.user.id;
    const destination = buildDestination({
      typeFolder: folder,
      tutorId,
      originalName: fileName
    });

    const signedUrl = await generateSignedUrl(bucketName, destination, contentType);

    return res.status(200).json({
      signedUrl,
      filePath: destination,
      bucket: bucketName
    });
  } catch (err) {
    console.error("Error generating signed URL:", err);
    return res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

router.post("/tutor/:tutorId/pfp", verifyToken, async (req, res) => {
  console.log("Tutor PFP update endpoint called");
  console.log("Params:", req.params);
  console.log("Request body:", req.body);

  try {
    const { tutorId } = req.params;
    const { filePath } = req.body;

    if (!filePath) {
      console.log("No file path provided - returning 400");
      return res.status(400).json({ error: "filePath is required" });
    }

    const userId = String(req.user?._id || req.user?.id);
    console.log(`User ID: ${userId}, Tutor ID: ${tutorId}, User type: ${req.user?.type}`);

    if (String(userId) !== String(tutorId) && req.user?.type !== "Admin") {
      console.log("Authorization failed - user not authorized");
      return res.status(403).json({ error: "Not authorized" });
    }

    console.log("Looking up teacher in database...");
    const teacher = await Teacher.findById(tutorId);
    if (!teacher) {
      console.log("Teacher not found - returning 404");
      return res.status(404).json({ error: "Teacher not found" });
    }

    const bucket = GC_BUCKET_PFPS;
    console.log("PFP bucket:", bucket);

    if (!bucket) {
      console.log("No PFPS bucket configured - returning 500");
      return res.status(500).json({ error: "No PFPS bucket configured in .env (GC_BUCKET_PFPS)" });
    }

    const publicUrl = `https://storage.googleapis.com/${bucket}/${encodeURIComponent(filePath)}`;
    console.log("Generated public URL:", publicUrl);

    console.log("Checking for old profile picture to delete...");
    if (teacher.profile_picture && teacher.profile_picture.bucket && teacher.profile_picture.name) {
      console.log("Deleting old GCS profile picture...");
      await deleteFromGCS(teacher.profile_picture.bucket, teacher.profile_picture.name);
    } else if (teacher.profile_picture && teacher.profile_picture.path) {
      console.log("Deleting old local profile picture...");
      try {
        const localPath = path.isAbsolute(teacher.profile_picture.path)
          ? teacher.profile_picture.path
          : path.join(__dirname, "..", "uploads", teacher.profile_picture.filename || teacher.profile_picture.path);
        console.log("Local path to delete:", localPath);
        await fs.unlink(localPath).catch(() => {
          console.log("Local file delete failed (might not exist)");
        });
      } catch (err) {
        console.error("Error deleting local file:", err);
      }
    } else {
      console.log("No old profile picture to delete");
    }

    teacher.profile_picture = {
      filename: path.basename(filePath),
      originalname: path.basename(filePath),
      bucket: bucket,
      name: filePath,
      url: publicUrl,
    };

    console.log("Saving teacher with new profile picture...");
    await teacher.save();
    console.log("Teacher saved successfully");

    return res.status(200).json({
      message: "Profile picture updated",
      profile_picture: teacher.profile_picture,
    });
  } catch (err) {
    console.error("Profile picture update error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tutor/:tutorId/banner", verifyToken, async (req, res) => {
  console.log("Tutor banner update endpoint called");
  console.log("Params:", req.params);
  console.log("Request body:", req.body);

  try {
    const { tutorId } = req.params;
    const { filePath } = req.body;

    if (!filePath) {
      console.log("No file path provided - returning 400");
      return res.status(400).json({ error: "filePath is required" });
    }

    const userId = String(req.user?._id || req.user?.id);
    console.log(`User ID: ${userId}, Tutor ID: ${tutorId}, User type: ${req.user?.type}`);

    if (String(userId) !== String(tutorId) && req.user?.type !== "Admin") {
      console.log("Authorization failed - user not authorized");
      return res.status(403).json({ error: "Not authorized" });
    }

    console.log("Looking up teacher in database...");
    const teacher = await Teacher.findById(tutorId);
    if (!teacher) {
      console.log("Teacher not found - returning 404");
      return res.status(404).json({ error: "Teacher not found" });
    }

    const bucket = GC_BUCKET_BANNERS;
    console.log("Banner bucket:", bucket);

    if (!bucket) {
      console.log("No BANNERS bucket configured - returning 500");
      return res.status(500).json({ error: "No BANNERS bucket configured in .env (GC_BUCKET_BANNERS)" });
    }

    const publicUrl = `https://storage.googleapis.com/${bucket}/${encodeURIComponent(filePath)}`;
    console.log("Generated public URL:", publicUrl);

    console.log("Checking for old banner to delete...");
    if (teacher.banner && teacher.banner.bucket && teacher.banner.name) {
      console.log("Deleting old GCS banner...");
      await deleteFromGCS(teacher.banner.bucket, teacher.banner.name);
    } else if (teacher.banner && teacher.banner.path) {
      console.log("Deleting old local banner...");
      try {
        const localPath = path.isAbsolute(teacher.banner.path)
          ? teacher.banner.path
          : path.join(__dirname, "..", "uploads", teacher.banner.filename || teacher.banner.path);
        console.log("Local path to delete:", localPath);
        await fs.unlink(localPath).catch(() => {
          console.log("Local file delete failed (might not exist)");
        });
      } catch (err) {
        console.error("Error deleting local file:", err);
      }
    } else {
      console.log("No old banner to delete");
    }

    teacher.banner = {
      filename: path.basename(filePath),
      originalname: path.basename(filePath),
      bucket: bucket,
      name: filePath,
      url: publicUrl,
    };

    console.log("Saving teacher with new banner...");
    await teacher.save();
    console.log("Teacher saved successfully");

    return res.status(200).json({ message: "Banner updated", banner: teacher.banner });
  } catch (err) {
    console.error("Banner update error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/tutor/:tutorId/pfp", verifyToken, async (req, res) => {
  console.log("Delete PFP endpoint called");
  console.log("Params:", req.params);
  console.log("User from token:", req.user);

  try {
    const { tutorId } = req.params;
    const userId = String(req.user?._id || req.user?.id);
    console.log(`User ID: ${userId}, Tutor ID: ${tutorId}, User type: ${req.user?.type}`);

    if (String(userId) !== String(tutorId) && req.user?.type !== "Admin") {
      console.log("Authorization failed - user not authorized");
      return res.status(403).json({ error: "Not authorized" });
    }

    console.log("Looking up teacher in database...");
    const teacher = await Teacher.findById(tutorId);
    if (!teacher) {
      console.log("Teacher not found - returning 404");
      return res.status(404).json({ error: "Teacher not found" });
    }

    console.log("Current profile picture:", teacher.profile_picture);

    if (teacher.profile_picture && teacher.profile_picture.bucket && teacher.profile_picture.name) {
      console.log("Deleting GCS profile picture...");
      await deleteFromGCS(teacher.profile_picture.bucket, teacher.profile_picture.name);
    } else if (teacher.profile_picture && teacher.profile_picture.path) {
      console.log("Deleting old local profile picture...");
      try {
        const localPath = path.isAbsolute(teacher.profile_picture.path)
          ? teacher.profile_picture.path
          : path.join(__dirname, "..", "uploads", teacher.profile_picture.filename || teacher.profile_picture.path);
        console.log("Local path to delete:", localPath);
        await fs.unlink(localPath).catch(() => {
          console.log("Local file delete failed (might not exist)");
        });
      } catch (err) {
        console.error("Error deleting local file:", err);
      }
    } else {
      console.log("No profile picture to delete");
    }

    teacher.profile_picture = null;
    console.log("Saving teacher with null profile picture...");
    await teacher.save();
    console.log("Teacher saved successfully");

    return res.status(200).json({ message: "Profile picture deleted" });
  } catch (err) {
    console.error("Delete profile picture error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/tutor/:tutorId/banner", verifyToken, async (req, res) => {
  console.log("Delete banner endpoint called");
  console.log("Params:", req.params);
  console.log("User from token:", req.user);

  try {
    const { tutorId } = req.params;
    const userId = String(req.user?._id || req.user?.id);
    console.log(`User ID: ${userId}, Tutor ID: ${tutorId}, User type: ${req.user?.type}`);

    if (String(userId) !== String(tutorId) && req.user?.type !== "Admin") {
      console.log("Authorization failed - user not authorized");
      return res.status(403).json({ error: "Not authorized" });
    }

    console.log("Looking up teacher in database...");
    const teacher = await Teacher.findById(tutorId);
    if (!teacher) {
      console.log("Teacher not found - returning 404");
      return res.status(404).json({ error: "Teacher not found" });
    }

    console.log("Current banner:", teacher.banner);

    if (teacher.banner && teacher.banner.bucket && teacher.banner.name) {
      console.log("Deleting GCS banner...");
      await deleteFromGCS(teacher.banner.bucket, teacher.banner.name);
    } else if (teacher.banner && teacher.banner.path) {
      console.log("Deleting old local banner...");
      try {
        const localPath = path.isAbsolute(teacher.banner.path)
          ? teacher.banner.path
          : path.join(__dirname, "..", "uploads", teacher.banner.filename || teacher.banner.path);
        console.log("Local path to delete:", localPath);
        await fs.unlink(localPath).catch(() => {
          console.log("Local file delete failed (might not exist)");
        });
      } catch (err) {
        console.error("Error deleting local file:", err);
      }
    } else {
      console.log("No banner to delete");
    }

    teacher.banner = null;
    console.log("Saving teacher with null banner...");
    await teacher.save();
    console.log("Teacher saved successfully");

    return res.status(200).json({ message: "Banner deleted" });
  } catch (err) {
    console.error("Delete banner error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

console.log("Upload routes initialized successfully");
export default router;
