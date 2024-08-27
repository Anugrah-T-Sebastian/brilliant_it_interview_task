import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

// Set up __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination for uploaded files
    cb(null, path.join(__dirname, "../documents"));
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
export const uploadFile = (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).send({ message: err.message });
    }

    // If file upload is successful
    res.send({ message: "File uploaded successfully!", file: req.file });
  });
};
