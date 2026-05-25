import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} folder - Cloudinary folder name
 * @param {String} resourceType - 'image', 'raw', 'video', 'auto'
 * @returns {Promise<String>} - Cloudinary URL
 */
export const uploadToCloudinary = (fileBuffer, folder = 'aau-iapams', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) {
      reject(new Error('No file buffer provided'));
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(error.message || 'File upload failed'));
        } else if (!result) {
          reject(new Error('No result from Cloudinary'));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    try {
      const readableStream = Readable.from(fileBuffer);
      readableStream.pipe(uploadStream);
    } catch (streamError) {
      console.error('Stream error:', streamError);
      reject(new Error('Failed to create upload stream: ' + streamError.message));
    }
  });
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise<Boolean>}
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {String} url - Cloudinary URL
 * @returns {String} - Public ID
 */
export const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  return filename.split('.')[0];
};
