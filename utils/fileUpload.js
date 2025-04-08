const multer = require("multer");
const path = require("path");
const pb = require("../config/pocketbase");
const FormData = require("form-data");

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Configure file filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, JPG, PNG and GIF image files are allowed."
      )
    );
  }
};

// Configure upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Upload a file to PocketBase storage
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} filename - Original filename
 * @returns {Object} - File ID and URL
 */
const uploadFile = async (fileBuffer, filename) => {
  try {
    console.log(
      `Uploading file: ${filename}, size: ${fileBuffer.length} bytes`
    );

    // Create FormData and append file
    const formData = new FormData();
    const blob = new Blob([fileBuffer]);
    formData.append("file", blob, filename);

    // Upload to PocketBase 'images' collection
    const record = await pb.collection("images").create(formData);

    // Get file URL
    const fileUrl = pb.files.getUrl(record, record.file);

    return {
      id: record.id,
      url: fileUrl,
    };
  } catch (error) {
    console.error("PocketBase upload error:", error);
    throw new Error("File upload failed");
  }
};

/**
 * Delete a file from PocketBase storage
 * @param {String} fileId - File ID to delete
 * @returns {Boolean} - Success status
 */
const deleteFile = async (fileId) => {
  try {
    await pb.collection("images").delete(fileId);
    return true;
  } catch (error) {
    console.error("PocketBase delete error:", error);
    return false;
  }
};

module.exports = {
  upload,
  uploadFile,
  deleteFile,
};
