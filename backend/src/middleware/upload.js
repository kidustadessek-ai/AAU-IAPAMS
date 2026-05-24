import multer from 'multer';

// Use memory storage to get buffer
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, PNG are allowed.'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Export different upload configurations
export const uploadSingle = (fieldName) => upload.single(fieldName);

export const uploadMultiple = (fieldName, maxCount = 10) => upload.array(fieldName, maxCount);

export const uploadFields = (fields) => upload.fields(fields);

// Application documents upload
export const uploadApplicationDocs = upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'coverLetter', maxCount: 1 },
  { name: 'certificates', maxCount: 5 },
]);

// Profile photo upload
export const uploadProfilePhoto = upload.single('profilePhoto');

// Error handler for multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};
