const path = require("path");
const multer = require("multer");
const { fileURLToPath } = require("url");
const { StatusCodes } = require("http-status-codes");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination for uploaded files
    cb(null, path.join(__dirname, "../uploaded_documents"));
  },
  filename: (req, file, cb) => {
    // Set the file name, keeping the original name
    cb(null, file.originalname);
  },
});

// File filter to only accept PDF, DOCX, and TXT files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOCX, and TXT files are allowed!"), false);
  }
};

// Initialize multer with the storage configuration and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Controller to handle file upload
const uploadFile = (req, res) => {
  console.log("Got file upload request");
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
    }

    // If file upload is successful
    res
      .status(StatusCodes.OK)
      .send({ message: "File uploaded successfully!", file: req.file });
  });
};

module.exports = { uploadFile };
