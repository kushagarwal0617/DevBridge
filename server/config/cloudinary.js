const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'devbridge_files', // all uploads go into this folder in your Cloudinary account
    resource_type: 'auto', // auto-detects images, PDFs, zips, etc. instead of assuming only images
  },
});

module.exports = { cloudinary, storage };