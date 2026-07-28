/**
 * ===========================================
 * CLOUDINARY SERVICE - Image Upload
 * ===========================================
 * This service handles uploading, deleting, and managing images.
 */

const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ===========================================
// 1. UPLOAD IMAGE
// ===========================================
/**
 * Upload a single image to Cloudinary
 * @param {Buffer} buffer - Image buffer from multer
 * @param {string} folder - Folder name in Cloudinary (e.g., 'properties')
 * @returns {Promise<string>} - URL of uploaded image
 */
const uploadImage = (buffer, folder = 'properties') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// ===========================================
// 2. UPLOAD MULTIPLE IMAGES
// ===========================================
/**
 * Upload multiple images to Cloudinary
 * @param {Array} files - Array of file buffers from multer
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<Array<string>>} - Array of image URLs
 */
const uploadMultipleImages = async (files, folder = 'properties') => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file.buffer, folder));
    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
  } catch (error) {
    throw new Error(`Failed to upload images: ${error.message}`);
  }
};

// ===========================================
// 3. DELETE IMAGE
// ===========================================
/**
 * Delete an image from Cloudinary
 * @param {string} imageUrl - URL of the image to delete
 * @returns {Promise<boolean>} - True if deleted successfully
 */
const deleteImage = async (imageUrl) => {
  try {
    // Extract public ID from URL
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Delete image error:', error);
    return false;
  }
};

// ===========================================
// 4. DELETE MULTIPLE IMAGES
// ===========================================
/**
 * Delete multiple images from Cloudinary
 * @param {Array<string>} imageUrls - Array of image URLs to delete
 * @returns {Promise<Array<boolean>>} - Array of deletion results
 */
const deleteMultipleImages = async (imageUrls) => {
  try {
    const deletePromises = imageUrls.map((url) => deleteImage(url));
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    throw new Error(`Failed to delete images: ${error.message}`);
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages
};