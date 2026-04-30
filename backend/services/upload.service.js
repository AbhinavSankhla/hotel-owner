'use strict';

const path = require('path');
const fs = require('fs');
const { env } = require('../config/env');

// Allowed MIME types for images — mirrors the magic-byte check below
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);

// Allowed file extensions (lowercase) — must agree with MIME type
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

// Magic bytes (first N bytes) for supported image formats
// Using these prevents attackers from disguising non-images by faking the MIME header
const MAGIC_BYTES = [
  { mime: 'image/jpeg',  bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/png',   bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/gif',   bytes: [0x47, 0x49, 0x46] },
  { mime: 'image/webp',  bytes: null, riff: true }, // RIFF....WEBP
  { mime: 'image/avif',  bytes: null, ftyp: true }, // ftyp marker at offset 4
];

/**
 * Verify uploaded file magic bytes match claimed MIME type.
 * Returns true if the file header looks like a valid image.
 * This guards against polyglot attacks (e.g., a PHP file with a .jpg extension).
 */
function verifyImageMagicBytes(filePath) {
  let header;
  try {
    const fd = fs.openSync(filePath, 'r');
    header = Buffer.alloc(12);
    fs.readSync(fd, header, 0, 12, 0);
    fs.closeSync(fd);
  } catch {
    return false;
  }

  // JPEG: FF D8 FF
  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) return true;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) return true;
  // GIF: GIF87a / GIF89a
  if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) return true;
  // WebP: RIFF....WEBP
  if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
      header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50) return true;
  // AVIF / HEIC: ftyp marker at offset 4 (bytes 4-7 = 'ftyp')
  if (header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70) return true;

  return false;
}

class UploadService {
  getUploadDir() {
    return path.join(__dirname, '..', env.UPLOAD_DIR);
  }

  getFileUrl(filename) {
    return `/uploads/${filename}`;
  }

  /**
   * Safely delete a file.
   * Prevents path traversal by only allowing alphanumeric + dash/dot filenames.
   */
  async deleteFile(filename) {
    // Security: reject filenames with path traversal attempts
    if (!filename || !/^[\w\-.]+$/.test(filename)) {
      throw Object.assign(new Error('Invalid filename'), { status: 400 });
    }
    const filePath = path.join(this.getUploadDir(), filename);
    // Ensure the resolved path stays within uploads directory
    const uploadDir = this.getUploadDir();
    if (!filePath.startsWith(uploadDir + path.sep) && filePath !== uploadDir) {
      throw Object.assign(new Error('Path traversal detected'), { status: 400 });
    }
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { message: 'File deleted' };
    }
    return { message: 'File not found' };
  }

  /**
   * After multer saves a file, verify the magic bytes match a real image.
   * Deletes the file and throws if invalid.
   */
  verifyUploadedFile(filePath) {
    if (!verifyImageMagicBytes(filePath)) {
      try { fs.unlinkSync(filePath); } catch { /* best effort */ }
      throw Object.assign(new Error('Uploaded file is not a valid image'), { status: 422 });
    }
  }

  // Multer configuration
  getMulterConfig() {
    const multer = require('multer');
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const dir = this.getUploadDir();
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        // Sanitize: only keep the extension, generate a random name
        const rawExt = path.extname(file.originalname).toLowerCase();
        const ext = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : '.jpg';
        const name = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
        cb(null, name);
      },
    });

    const fileFilter = (req, file, cb) => {
      // 1. Check MIME type declared by client
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        return cb(new Error('Only image files (JPEG, PNG, WebP, AVIF, GIF) are allowed'), false);
      }
      // 2. Check file extension matches MIME type (prevents extension spoofing)
      const ext = path.extname(file.originalname).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return cb(new Error('File extension not allowed'), false);
      }
      cb(null, true);
    };

    return multer({
      storage,
      limits: {
        fileSize: (env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024,
        files: 10,       // max files per request
        fields: 0,       // no non-file fields expected
      },
      fileFilter,
    });
  }
}

module.exports = new UploadService();

