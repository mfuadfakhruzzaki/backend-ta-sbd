const multer = require("multer");
const {
  uploadFileToPocketBase,
  deleteFileFromPocketBase,
} = require("../config/pocketbase");

// Konfigurasi multer untuk penyimpanan di memory
const storage = multer.memoryStorage();

// Konfigurasi filter file untuk mengizinkan hanya gambar
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipe file tidak valid. Hanya file gambar JPEG, JPG, PNG dan GIF yang diizinkan."
      )
    );
  }
};

// Konfigurasi upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Batas 5MB
  },
});

/**
 * Upload file ke PocketBase
 * @param {Buffer} fileBuffer - Buffer file dari multer
 * @param {String} filename - Nama file asli
 * @returns {Object} - ID dan URL file
 */
const uploadFile = async (fileBuffer, filename) => {
  try {
    console.log(
      `Uploading file: ${filename}, size: ${fileBuffer.length} bytes`
    );

    // Upload file ke PocketBase menggunakan fungsi yang sudah diperbaiki
    const result = await uploadFileToPocketBase(fileBuffer, filename);

    return {
      id: result.id,
      url: result.url,
    };
  } catch (error) {
    console.error("PocketBase upload error:", error);
    throw new Error("File upload failed");
  }
};

/**
 * Hapus file dari PocketBase
 * @param {String} fileId - ID file yang akan dihapus
 * @returns {Boolean} - Status keberhasilan
 */
const deleteFile = async (fileId) => {
  try {
    return await deleteFileFromPocketBase(fileId);
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
