import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(`Selected file: ${e.target.files[0].name}`);
  };

  const onFileUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:3000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage("File upload failed.");
      console.error("There was an error uploading the file!", error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length) {
      setFile(files[0]);
      setMessage(`Selected file: ${files[0].name}`);
    }
  };

  return (
    <div>
      <h4>Upload Documents</h4>
      <div
        className={`file-upload-background ${dragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          onChange={onFileChange}
          style={{ display: "none" }}
          id="fileInput"
        />
        <label htmlFor="fileInput">
          <div className="upload-area">
            <img
              src="https://uxwing.com/wp-content/themes/uxwing/download/file-and-folder-type/upload-file-icon.png"
              alt="Upload Icon"
              className="upload-logo"
            />

            <p>Drag and drop a file here or click to upload</p>
          </div>
        </label>
      </div>
      <button onClick={onFileUpload}>Upload</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FileUpload;
