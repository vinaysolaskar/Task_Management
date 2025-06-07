// src/utils/googleDrive.js
require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');

// Load credentials from .env
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID; // The shared folder ID

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oauth2Client });

async function uploadFileToDrive(file) {
  // file: { path, originalname, mimetype }
  const fileMetadata = {
    name: file.originalname,
    parents: [DRIVE_FOLDER_ID],
  };
  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path),
  };
  try {
    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, name',
    });
    // Make file public
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
    });
    // Get public URL
    const fileUrl = `https://drive.google.com/uc?id=${response.data.id}&export=download`;
    console.log('File uploaded to Google Drive:', response.data.name, fileUrl);
    return { fileId: response.data.id, fileName: response.data.name, fileUrl };
  } catch (error) {
    console.error('Failed to upload file to Google Drive:', error.message);
    throw error;
  }
}

module.exports = { uploadFileToDrive };
