const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const env = require('../config/env');
const { AppError } = require('./error.middleware');

/**
 * File uploads (item photos, receipts, found-item photos, avatars).
 *
 * Files are received in memory, then stored:
 *   - in Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production on Vercel,
 *     whose own disk is read-only and wiped between requests), or
 *   - in the local uploads/ folder otherwise (development).
 * Afterwards every file object has `file.url` (the public URL to save) and
 * `file.filename`.
 */

// A connected Blob store provides BLOB_READ_WRITE_TOKEN and/or BLOB_STORE_ID
// (the SDK can authenticate with the store id via Vercel's OIDC token).
const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
// Vercel's filesystem is read-only, so never fall back to local disk there.
const onVercel = Boolean(process.env.VERCEL);
const useBlob = blobConfigured || onVercel;
const uploadDir = path.resolve(__dirname, '../../', env.upload.uploadDir);

const parseSize = (value) => {
  if (typeof value === 'number') return value;
  const match = /^(\d+(?:\.\d+)?)\s*(kb|mb|gb)?$/i.exec(String(value || '').trim());
  if (!match) return 5 * 1024 * 1024;
  const units = { kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 };
  return Math.round(Number(match[1]) * (units[(match[2] || '').toLowerCase()] || 1));
};

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

const fileFilter = (req, file, cb) => {
  if (allowedImageTypes.has(file.mimetype) || file.mimetype === 'application/pdf') return cb(null, true);
  return cb(new AppError('Invalid file type. Only images and PDFs are allowed.', 400));
};

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseSize(env.upload.maxFileSize) },
  fileFilter
});

const storedName = (file) => {
  const extension = path.extname(file.originalname || '').toLowerCase().replace(/[^.a-z0-9]/g, '') || '';
  return `${file.fieldname}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extension}`;
};

const saveFile = async (file, req) => {
  const filename = storedName(file);
  if (useBlob) {
    if (!blobConfigured) {
      throw new Error('file storage is not configured on this deployment. Connect a Vercel Blob store to the backend project and redeploy.');
    }
    const { put } = require('@vercel/blob');
    // Not under "uploads/": the frontend rewrites /uploads/ paths to the API.
    const blob = await put(`files/${filename}`, file.buffer, {
      access: 'public',
      contentType: file.mimetype,
      addRandomSuffix: false
    });
    return { filename, url: blob.url };
  }
  await fs.promises.mkdir(uploadDir, { recursive: true });
  await fs.promises.writeFile(path.join(uploadDir, filename), file.buffer);
  return { filename, url: `${req.protocol}://${req.get('host')}/uploads/${filename}` };
};

// Runs after multer: stores every received file and adds url/filename to it.
const persistUploads = async (req, res, next) => {
  try {
    const files = [
      ...(req.file ? [req.file] : []),
      ...(Array.isArray(req.files) ? req.files : Object.values(req.files || {}).flat())
    ];
    await Promise.all(files.map(async (file) => {
      Object.assign(file, await saveFile(file, req));
      file.buffer = undefined; // free memory once stored
    }));
    next();
  } catch (error) {
    next(new AppError(`Could not store the uploaded file: ${error.message}`, 500));
  }
};

// Same API as multer (upload.single / upload.fields / upload.array); each
// returns [multer, persistUploads], which Express accepts as route middleware.
const upload = {
  single: (...args) => [multerUpload.single(...args), persistUploads],
  fields: (...args) => [multerUpload.fields(...args), persistUploads],
  array: (...args) => [multerUpload.array(...args), persistUploads],
  none: () => multerUpload.none()
};

module.exports = { upload, useBlob };
