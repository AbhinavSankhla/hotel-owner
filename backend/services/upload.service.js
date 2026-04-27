'use strict';

const path = require('path');
const fs = require('fs');
const { env } = require('../config/env');

class UploadService {
  getUploadDir() {
    return path.join(__dirname, '..', env.UPLOAD_DIR);
  }

  getFileUrl(filename) {
    return `/uploads/${filename}`;
  }

  async deleteFile(filename) {
    const filePath = path.join(this.getUploadDir(), filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { message: 'File deleted' };
    }
    return { message: 'File not found' };
  }

  // Multer configuration is defined here and exported for use in routes
  getMulterConfig() {
    const multer = require('multer');
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const dir = this.getUploadDir();
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
        cb(null, name);
      },
    });

    const fileFilter = (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
      if (allowed.includes(file.mimetype)) cb(null, true);
      else cb(new Error('Only image files are allowed'), false);
    };

    return multer({
      storage,
      limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
      fileFilter,
    });
  }
}

module.exports = new UploadService();
