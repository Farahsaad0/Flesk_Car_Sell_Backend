const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define storage options
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "./public/uploads/";
    // Check if upload directory exists, create if not
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique file name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  },
});

// Filter for allowed file types
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new Error(
        "Unsupported file format. Please upload an image in JPEG or PNG format."
      )
    );
  }
};

// Single file upload instance
const single_upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // Limit file size to 5 MB
  },
}).single("photo"); // Change this field as per your requirement

// Multiple file upload instance
const multi_upload = multer({
  storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // Limit file size to 5 MB
    files: 10, // Limit number of files to 10
  },
}).array("photos", 10); // Change this field as per your requirement

module.exports = {
  single_upload,
  multi_upload,
};
