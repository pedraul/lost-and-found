const fs = require('fs');
const path = require('path');
const env = require('./env');

// Local storage implementation (default)
const localStorage = {
  ensureUploadDir: () => {
    const uploadDir = path.resolve(__dirname, '../../', env.upload.uploadDir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
  },

  saveFile: async (file) => {
    const uploadDir = localStorage.ensureUploadDir();
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, filename);

    await fs.promises.writeFile(filePath, file.buffer);

    return {
      url: `/uploads/${filename}`,
      filename
    };
  },

  deleteFile: async (filename) => {
    const uploadDir = localStorage.ensureUploadDir();
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
};

// S3 storage implementation (for production)
const s3Storage = {
  saveFile: async (file) => {
    // Requires AWS SDK v3: @aws-sdk/client-s3
    // Implemented when AWS credentials are configured
    throw new Error('S3 storage not configured. Set STORAGE_PROVIDER=local or configure AWS credentials.');
  },

  deleteFile: async (filename) => {
    throw new Error('S3 storage not configured.');
  }
};

const storage = env.storage.provider === 's3' ? s3Storage : localStorage;

module.exports = storage;