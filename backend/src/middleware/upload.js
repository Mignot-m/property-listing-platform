/**
 * ===========================================
 * MULTER MIDDLEWARE - File Upload
 * ===========================================
 * This middleware handles file upload validation and processing.
 */

const multer = require('multer');
const path = require('path');

// ===========================================
// 1. FILE FILTER
// ===========================================
/**
 * Filter allowed file types
 * Only images are allowed (jpg, jpeg, png, gif, webp)
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp)'), false);
  }
};

// ===========================================
// 2. MULTER CONFIGURATION
// ===========================================
/**
 * Memory storage is used to store files in memory before uploading to Cloudinary
 * Limits: 5MB per file, max 10 files
 */
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  },
  fileFilter: fileFilter
});

// ===========================================
// 3. ERROR HANDLING
// ===========================================
/**
 * Handle multer errors
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Max size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next(err);
};

module.exports = {
  upload,
  handleMulterError
};