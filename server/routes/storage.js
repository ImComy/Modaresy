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

// Basic validation for required bucket envs (log warnings only; don't crash)
if (!GC_BUCKET_PFPS) console.warn('Warning: GC_BUCKET_PFPS is not set');
if (!GC_BUCKET_BANNERS) console.warn('Warning: GC_BUCKET_BANNERS is not set');
if (!GC_BUCKET_UPLOADS) console.warn('Warning: GC_BUCKET_UPLOADS is not set');

// Validate and build storage options safely.
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

// Clear env vars that would cause accidental file lookups when using in-memory credentials
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
    console.error("GCS connection failed:", error && error.message ? error.message : error);
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

// Helpers
async function uploadBufferToGCS({ buffer, filename, destinationPath, contentType, bucketName }) {
  console.log(`Uploading to GCS - Bucket: ${bucketName}, Destination: ${destinationPath}, ContentType: ${contentType}`);

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(destinationPath);
  console.log(`GCS file object created: ${file.name}`);

  const streamOpts = { resumable: false, contentType };
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
      console.warn("Failed to make file public:", err && err.message ? err.message : err);
    }
  } else {
    console.log("Skipping makePublic (GCS_MAKE_PUBLIC is false)");
  }

  // Encode each path segment separately to preserve '/' separators in the public URL
  const encodedPath = destinationPath.split('/').map(encodeURIComponent).join('/');
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodedPath}`;
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
    console.error("GCS delete error:", err && err.message ? err.message : err);
    return false;
  }
}

/**
 * Archive (move) a file within the same bucket into an "old" subfolder:
 * e.g. pfps/123/filename.ext -> pfps/old/123/filename.ext
 *
 * If the object is already in an `old` folder, this function will permanently delete it.
 * Returns: { archived: true, newName } on archive, { deleted: true } on permanent delete, or throws.
 */
async function archiveFileInBucket(bucketName, objectName) {
  console.log(`Archive request - bucket: ${bucketName}, object: ${objectName}`);
  if (!bucketName || !objectName) {
    throw new Error('Missing bucketName or objectName for archive');
  }

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(objectName);

  try {
    const [exists] = await file.exists();
    if (!exists) {
      console.log("archiveFileInBucket: file does not exist, nothing to archive");
      return { missing: true };
    }

    // If already under an "old" segment, do permanent delete (to avoid nested old/old/old).
    if (objectName.includes('/old/')) {
      console.log("Object already in /old/ - performing permanent delete");
      await file.delete({ ignoreNotFound: true });
      console.log("Permanently deleted archived file:", objectName);
      return { deleted: true };
    }

    // Build new path: insert 'old' right after the top-level folder
    // Example: 'pfps/123/foo.png' -> 'pfps/old/123/foo.png'
    const parts = objectName.split('/');
    if (parts.length < 2) {
      // If shape unexpected, place under 'old' prefix directly
      const fallbackName = `old/${path.basename(objectName)}`;
      console.log(`Unexpected objectName layout; using fallback archive path: ${fallbackName}`);
      try {
        await file.move(fallbackName);
        console.log(`Archived to fallback path: ${fallbackName}`);
        const encodedPath = fallbackName.split('/').map(encodeURIComponent).join('/');
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodedPath}`;
        // Make public if configured
        if (String(GCS_MAKE_PUBLIC).toLowerCase() === 'true') {
          await bucket.file(fallbackName).makePublic().catch(e => console.warn('makePublic failed on archived file', e));
        }
        return { archived: true, newName: fallbackName, publicUrl };
      } catch (err) {
        console.warn('Fallback archive move failed, attempting copy+delete', err);
        // fallback to copy+delete
      }
    } else {
      const top = parts[0];
      const rest = parts.slice(1).join('/');
      const newName = `${top}/old/${rest}`;

      console.log(`Attempting to move file to archive path: ${newName}`);
      try {
        // server-side rename (fast)
        await file.move(newName);
        console.log(`File moved to archive path: ${newName}`);
        // Make public if configured (to preserve same visibility)
        if (String(GCS_MAKE_PUBLIC).toLowerCase() === 'true') {
          await bucket.file(newName).makePublic().catch(e => console.warn('makePublic failed on archived file', e));
        }
        const encodedPath = newName.split('/').map(encodeURIComponent).join('/');
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodedPath}`;
        return { archived: true, newName, publicUrl };
      } catch (moveErr) {
        console.warn('file.move failed, attempting copy+delete fallback', moveErr);
        // Try copy then delete
        try {
          const destFile = bucket.file(newName);
          await file.copy(destFile);
          console.log('Copied to archive path success:', newName);
          // Make archived file public if configured
          if (String(GCS_MAKE_PUBLIC).toLowerCase() === 'true') {
            await destFile.makePublic().catch(e => console.warn('makePublic failed on copied archived file', e));
          }
          // Delete original
          await file.delete({ ignoreNotFound: true });
          console.log('Original deleted after copy');
          const encodedPath = newName.split('/').map(encodeURIComponent).join('/');
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodedPath}`;
          return { archived: true, newName, publicUrl };
        } catch (copyErr) {
          console.error('archiveFileInBucket: copy+delete fallback failed', copyErr);
          throw copyErr;
        }
      }
    }
  } catch (err) {
    console.error('archiveFileInBucket error:', err && err.message ? err.message : err);
    throw err;
  }
}

function buildDestination({ typeFolder, tutorId, originalName }) {
  const ext = path.extname(originalName || '') || "";
  // Descriptive filename: <tutorId>-YYYYMMDD-HHMMSS-<random><ext>
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const timePart = `H${pad(now.getHours())}M${pad(now.getMinutes())}S${pad(now.getSeconds())}`;
  const randomPart = Math.round(Math.random() * 1e9);
  const filename = `${tutorId}-${datePart}-${timePart}-${randomPart}${ext}`;
  const destination = `${typeFolder}/${tutorId}/${filename}`;

  console.log(`Built descriptive destination path: ${destination} (original: ${originalName})`);
  return destination;
}

// IMPORTANT: Signing the contentType in a signed URL will cause browsers to issue a preflight (OPTIONS)
// request because the signed URL requires the Content-Type header to match. To avoid CORS preflight
// for uploads from browsers, do NOT sign contentType unless strictly necessary. The client can still
// send a Content-Type header if it was NOT included when signing.
async function generateSignedUrl(bucketName, fileName, contentType, signContentType = false) {
  console.log(`Generating signed URL for bucket: ${bucketName}, file: ${fileName}, signContentType: ${signContentType}`);

  const options = {
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000,
  };

  if (signContentType && contentType) {
    options.contentType = contentType;
  }

  try {
    const [url] = await storage
      .bucket(bucketName)
      .file(fileName)
      .getSignedUrl(options);

    console.log("Generated signed URL:", url);
    return url;
  } catch (error) {
    console.error("Error generating signed URL:", error && error.message ? error.message : error);
    throw error;
  }
}

// Small whitelist of allowed image extensions for PFPS/BANNERS. Prevent strange uploads.
const IMAGE_EXT_WHITELIST = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);

// File size limits (10MB for non-banner, no explicit limit for banner)
const MAX_FILE_SIZE_NON_BANNER = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE_BANNER = 10 * 1024 * 1024; // 50MB for banner (or no explicit limit)

router.post("/generateUploadUrl", verifyToken, async (req, res) => {
  console.log("Generate upload URL endpoint called");
  console.log("Request body:", req.body);

  try {
    const { fileName, contentType, fileType, signContentType, fileSize } = req.body;

    if (!fileName || !fileType) {
      console.log("Missing required parameters - returning 400");
      return res.status(400).json({ error: "fileName and fileType are required" });
    }

    // Basic filename length check
    if (typeof fileName !== 'string' || fileName.length > 255) {
      return res.status(400).json({ error: 'Invalid fileName' });
    }

    // Apply file size limits based on fileType
    if (fileSize) {
      const maxSize = fileType === 'banner' ? MAX_FILE_SIZE_BANNER : MAX_FILE_SIZE_NON_BANNER;
      
      if (fileSize > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
        console.log(`File size too large: ${fileSizeMB}MB exceeds ${maxSizeMB}MB limit for ${fileType}`);
        return res.status(400).json({ 
          error: `File size too large: ${fileSizeMB}MB exceeds ${maxSizeMB}MB limit for ${fileType} files` 
        });
      }
    }

    let bucketName;
    let folder;

    switch (fileType) {
      case 'pfp':
        bucketName = GC_BUCKET_PFPS;
        folder = 'pfps';
        break;
      case 'banner':
        bucketName = GC_BUCKET_BANNERS;
        folder = 'banners';
        break;
      case 'upload':
        bucketName = GC_BUCKET_UPLOADS;
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

    // For PFPS/BANNERS, enforce an image extension whitelist
    const ext = path.extname(fileName).toLowerCase();
    if ((fileType === 'pfp' || fileType === 'banner') && !IMAGE_EXT_WHITELIST.has(ext)) {
      console.log('Rejected file extension for pfp/banner:', ext);
      return res.status(400).json({ error: 'Invalid file extension for image upload' });
    }

    const tutorId = String(req.user._id || req.user.id);
    const destination = buildDestination({
      typeFolder: folder,
      tutorId,
      originalName: fileName
    });

    // signContentType: optional flag. By default we DO NOT sign contentType to avoid preflight.
    const signedUrl = await generateSignedUrl(bucketName, destination, contentType, Boolean(signContentType));

    return res.status(200).json({
      signedUrl,
      filePath: destination,
      bucket: bucketName,
      maxFileSize: fileType === 'banner' ? MAX_FILE_SIZE_BANNER : MAX_FILE_SIZE_NON_BANNER
    });
  } catch (err) {
    console.error("Error generating signed URL:", err && err.message ? err.message : err);
    return res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

// Helper to set Teacher's picture or banner object and archive old object instead of deleting permanently.
async function setTeacherMedia({ tutorId, type, filePath, bucket }) {
  const teacher = await Teacher.findById(tutorId);
  if (!teacher) throw new Error('Teacher not found');

  // Encode each path segment to avoid encoding slashes which would break the URL
  const encodedFilePath = filePath.split('/').map(encodeURIComponent).join('/');
  const publicUrl = `https://storage.googleapis.com/${bucket}/${encodedFilePath}`;

  // archive old (move to /old/) instead of deleting permanently
  try {
    if (type === 'pfp') {
      if (teacher.profile_picture && teacher.profile_picture.bucket && teacher.profile_picture.name) {
        try {
          await archiveFileInBucket(teacher.profile_picture.bucket, teacher.profile_picture.name)
            .catch(err => console.warn('Old pfp archive failed', err));
        } catch (err) {
          console.warn('archiveFileInBucket thrown for old pfp', err);
        }
      }
      teacher.profile_picture = {
        filename: path.basename(filePath),
        originalname: path.basename(filePath),
        bucket: bucket,
        name: filePath,
        url: publicUrl,
      };
    } else if (type === 'banner') {
      if (teacher.banner && teacher.banner.bucket && teacher.banner.name) {
        try {
          await archiveFileInBucket(teacher.banner.bucket, teacher.banner.name)
            .catch(err => console.warn('Old banner archive failed', err));
        } catch (err) {
          console.warn('archiveFileInBucket thrown for old banner', err);
        }
      }
      teacher.banner = {
        filename: path.basename(filePath),
        originalname: path.basename(filePath),
        bucket: bucket,
        name: filePath,
        url: publicUrl,
      };
    }

    // Ensure the newly uploaded file is publicly accessible if configured
    try {
      if (String(GCS_MAKE_PUBLIC).toLowerCase() === 'true') {
        const file = storage.bucket(bucket).file(filePath);
        await file.makePublic().catch(err => {
          console.warn('Failed to make uploaded file public:', err && err.message ? err.message : err);
        });
      }
    } catch (err) {
      console.warn('makePublic check failed:', err && err.message ? err.message : err);
    }

    await teacher.save();
    return type === 'pfp' ? teacher.profile_picture : teacher.banner;
  } catch (err) {
    console.warn('setTeacherMedia error:', err && err.message ? err.message : err);
    throw err;
  }
}

router.post("/tutor/:tutorId/pfp", verifyToken, async (req, res) => {
  console.log("Tutor PFP update endpoint called");
  console.log("Params:", req.params);
  console.log("Request body:", req.body);

  try {
    const { tutorId } = req.params;
    const { filePath } = req.body;

    if (!filePath) return res.status(400).json({ error: "filePath is required" });

    const userId = String(req.user?._id || req.user?.id);
    if (String(userId) !== String(tutorId) && req.user?.type !== "Admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Verify teacher exists and set picture
    try {
      const result = await setTeacherMedia({ tutorId, type: 'pfp', filePath, bucket: GC_BUCKET_PFPS });
      return res.status(200).json({ message: "Profile picture updated", profile_picture: result });
    } catch (err) {
      if (err.message === 'Teacher not found') return res.status(404).json({ error: 'Teacher not found' });
      throw err;
    }
  } catch (err) {
    console.error("Profile picture update error:", err && err.message ? err.message : err);
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

    if (!filePath) return res.status(400).json({ error: "filePath is required" });

    const userId = String(req.user?._id || req.user?.id);
    if (String(userId) !== String(tutorId) && req.user?.type !== "Admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    try {
      const result = await setTeacherMedia({ tutorId, type: 'banner', filePath, bucket: GC_BUCKET_BANNERS });
      return res.status(200).json({ message: "Banner updated", banner: result });
    } catch (err) {
      if (err.message === 'Teacher not found') return res.status(404).json({ error: 'Teacher not found' });
      throw err;
    }
  } catch (err) {
    console.error("Banner update error:", err && err.message ? err.message : err);
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
    if (String(userId) !== String(tutorId) && req.user?.type !== "Admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const teacher = await Teacher.findById(tutorId);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    // archive storage object if exists (moves to /old/)
    if (teacher.profile_picture && teacher.profile_picture.bucket && teacher.profile_picture.name) {
      try {
        await archiveFileInBucket(teacher.profile_picture.bucket, teacher.profile_picture.name)
          .catch(err => console.warn('Archive pfp failed', err));
      } catch (err) {
        console.warn('archiveFileInBucket threw for pfp delete endpoint:', err);
      }
    }

    teacher.profile_picture = null;
    await teacher.save();

    return res.status(200).json({ message: "Profile picture deleted (archived)" });
  } catch (err) {
    console.error("Delete profile picture error:", err && err.message ? err.message : err);
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
    if (String(userId) !== String(tutorId) && req.user?.type !== "Admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const teacher = await Teacher.findById(tutorId);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    if (teacher.banner && teacher.banner.bucket && teacher.banner.name) {
      try {
        await archiveFileInBucket(teacher.banner.bucket, teacher.banner.name)
          .catch(err => console.warn('Archive banner failed', err));
      } catch (err) {
        console.warn('archiveFileInBucket threw for banner delete endpoint:', err);
      }
    }

    teacher.banner = null;
    await teacher.save();

    return res.status(200).json({ message: "Banner deleted (archived)" });
  } catch (err) {
    console.error("Delete banner error:", err && err.message ? err.message : err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

console.log("Upload routes initialized successfully");
export default router;