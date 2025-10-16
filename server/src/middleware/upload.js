const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadImage, uploadMultipleImages } = require('../config/cloudinary');

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer to use memory storage (required for Cloudinary)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: fileFilter
});

// Helper function to convert buffer to temporary file
const bufferToTempFile = (buffer, originalname) => {
  const tempPath = path.join(tempDir, Date.now() + '-' + originalname);
  fs.writeFileSync(tempPath, buffer);
  return tempPath;
};

// Upload multiple files to Cloudinary
const uploadMultipleToCloudinary = async (files, folder = 'properties') => {
  try {
    const tempFiles = [];
    const uploadPromises = files.map(file => {
      // Convert buffer to temporary file
      const tempFilePath = bufferToTempFile(file.buffer, file.originalname);
      tempFiles.push(tempFilePath);
      return uploadImage(tempFilePath, folder);
    });

    const results = await Promise.all(uploadPromises);
    
    // Clean up all temporary files
    tempFiles.forEach(tempFilePath => {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    });
    
    return results;
  } catch (error) {
    // Clean up any temporary files that were created
    tempFiles.forEach(tempFilePath => {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    });
    throw error;
  }
};

// ✅ FIXED: Middleware for multiple file upload with Cloudinary
const uploadMultipleCloudinary = (fieldName, maxCount = 10) => {
  return [
    upload.array(fieldName, maxCount),
    async (req, res, next) => {
      try {
        if (req.files && req.files.length > 0) {
          console.log(`📤 Uploading ${req.files.length} files to Cloudinary...`);
          const results = await uploadMultipleToCloudinary(req.files, 'properties');
          req.files.cloudinaryResults = results;
          console.log('✅ Files uploaded to Cloudinary:', results.map(r => r.url));
        }
        next();
      } catch (error) {
        console.error('❌ Cloudinary upload error:', error);
        next(error);
      }
    }
  ];
};

// ✅ FIXED: Simple middleware without Cloudinary processing (for testing)
const uploadMultiple = (fieldName, maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// Export the middleware
module.exports = {
  uploadSingle: (fieldName) => upload.single(fieldName),
  uploadMultiple, // Simple multer middleware
  uploadMultipleCloudinary, // Cloudinary middleware
  uploadFields: (fields) => upload.fields(fields)
};