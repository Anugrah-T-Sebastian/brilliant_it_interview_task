const express = require("express");
const router = express.Router();

const { uploadFile } = require("../controllers/document");

router.post("/upload", uploadFile);
router.get("/", (req, res) => {
  res.send("Server is running");
});

module.exports = router;
