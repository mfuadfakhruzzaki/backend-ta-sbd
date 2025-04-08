// Gunakan node-fetch untuk menangani upload file
const fetch = require("node-fetch");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const os = require("os");
const https = require("https");

// URL base untuk PocketBase
const pocketbaseUrl =
  process.env.POCKETBASE_URL ||
  "https://tugas-akhir-sbd-pocketbase-1aa788-34-50-95-184.traefik.me";

// Buat agen HTTPS yang mengabaikan validasi sertifikat
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Mengabaikan validasi sertifikat SSL
});

/**
 * Upload file ke PocketBase menggunakan API HTTP langsung
 * @param {Buffer} fileBuffer - Buffer file
 * @param {String} fileName - Nama file
 * @returns {Promise<Object>} - Data file yang diupload
 */
async function uploadFileToPocketBase(fileBuffer, fileName) {
  try {
    // Simpan buffer ke file sementara
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, fileName);

    // Tulis buffer ke file sementara
    fs.writeFileSync(tempFilePath, fileBuffer);

    // Buat form data
    const formData = new FormData();

    // Tambahkan file dari path file
    formData.append("file", fs.createReadStream(tempFilePath));

    // Tambahkan field lain jika diperlukan
    formData.append("name", fileName);

    console.log(
      `Sending request to: ${pocketbaseUrl}/api/collections/images/records`
    );

    // Kirim request ke PocketBase
    const response = await fetch(
      `${pocketbaseUrl}/api/collections/images/records`,
      {
        method: "POST",
        body: formData,
        agent: httpsAgent, // Gunakan agen yang mengabaikan validasi sertifikat
        headers: {
          // FormData akan menambahkan Content-Type dan boundary secara otomatis
        },
      }
    );

    // Hapus file sementara
    fs.unlinkSync(tempFilePath);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `PocketBase upload failed: ${response.status} ${errorText}`
      );
    }

    // Parse response
    const data = await response.json();
    console.log("PocketBase upload response:", data);

    // Generate URL file
    const fileUrl = `${pocketbaseUrl}/api/files/${data.collectionId}/${data.id}/${data.file}`;

    return {
      id: data.id,
      url: fileUrl,
    };
  } catch (error) {
    console.error("PocketBase upload error:", error);
    throw error;
  }
}

/**
 * Delete file dari PocketBase menggunakan API HTTP langsung
 * @param {String} fileId - ID file
 * @returns {Promise<boolean>} - Status keberhasilan
 */
async function deleteFileFromPocketBase(fileId) {
  try {
    const response = await fetch(
      `${pocketbaseUrl}/api/collections/images/records/${fileId}`,
      {
        method: "DELETE",
        agent: httpsAgent, // Gunakan agen yang mengabaikan validasi sertifikat
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `PocketBase delete failed: ${response.status} ${errorText}`
      );
    }

    return true;
  } catch (error) {
    console.error("PocketBase delete error:", error);
    return false;
  }
}

module.exports = {
  uploadFileToPocketBase,
  deleteFileFromPocketBase,
};
