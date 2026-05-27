import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} folder - Cloudinary folder name
 * @param {String} resourceType - 'image', 'raw', 'video', 'auto'
 * @param {String} originalFilename - Original filename with extension
 * @param {String} mimetype - File MIME type
 * @returns {Promise<Object>} - Object containing url, filename, and mimetype
 */
export const uploadToCloudinary = (fileBuffer, folder = 'aau-iapams', resourceType = 'auto', originalFilename = '', mimetype = '') => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) {
      reject(new Error('No file buffer provided'));
      return;
    }

    // Extract filename without extension for public_id
    const filenameWithoutExt = originalFilename ? originalFilename.split('.').slice(0, -1).join('.') : `file_${Date.now()}`;
    const extension = originalFilename ? originalFilename.split('.').pop() : '';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        public_id: filenameWithoutExt, // Preserve original filename
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        flags: 'attachment', // Keep attachment flag
        access_mode: 'public',
        format: extension || undefined, // Preserve extension
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(error.message || 'File upload failed'));
        } else if (!result) {
          reject(new Error('No result from Cloudinary'));
        } else {
          // Return complete file metadata
          resolve({
            url: result.secure_url, // Keep fl_attachment in URL
            filename: originalFilename || `${result.public_id}.${result.format}`,
            mimetype: mimetype || 'application/octet-stream',
          });
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
