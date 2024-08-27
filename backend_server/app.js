import express from "express";
import { uploadFile } from "./controllers/document.js";

const app = express();
const PORT = process.env.PORT || 3003;

// Define a POST route for file uploads
app.post("/upload", uploadFile);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
