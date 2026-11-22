const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');
const { AppError } = require('./error.middleware');

// Ensure upload directory exists
const uploadDir = path.resolve(__dirname, '../../', env.upload.uploadDir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]);
  const isImage = allowedImageTypes.has(file.mimetype);
  const isPdf = file.mimetype === 'application/pdf';

  if (isImage || isPdf) {
    return cb(null, true);
  }
  return cb(new AppError('Invalid file type. Only images and PDFs are allowed.', 400));
};

// File size limiter
const upload = multer({
  storage,
  limits: {
    fileSize: env.upload.maxFileSize || 5 * 1024 * 1024 // Default 5MB
  },
  fileFilter
});

module.exports = { upload };