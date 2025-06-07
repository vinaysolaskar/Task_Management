const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { uploadFileToDrive } = require('../utils/googleDrive');

// --- Old disk storage code (commented out) ---
/*
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});
*/
// --- End old code ---

// Use memory storage so files are not saved to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|csv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image, PDF, or CSV files are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

// Middleware to upload file to Google Drive after multer
const uploadToDrive = async (req, res, next) => {
  if (!req.file) return next();
  // Save buffer to a temp file (Google Drive API needs a file path)
  const tempPath = path.join(os.tmpdir(), Date.now() + '-' + req.file.originalname);
  fs.writeFileSync(tempPath, req.file.buffer);
  try {
    const driveResult = await uploadFileToDrive({
      path: tempPath,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
    });
    req.fileUrl = driveResult.fileUrl;
    req.fileName = driveResult.fileName;
    fs.unlinkSync(tempPath); // Clean up temp file
    next();
  } catch (err) {
    fs.unlinkSync(tempPath);
    next(err);
  }
};

module.exports = { upload, uploadToDrive };
