import axios from 'axios';
import Application from '../models/Application.js';

// @desc    Download file from Cloudinary
// @route   GET /api/v1/download
// @access  Private
export const downloadFile = async (req, res) => {
  try {
    const { applicationId, fileType } = req.query; // fileType: 'cv', 'coverLetter', 'certificate'

    if (!applicationId || !fileType) {
      return res.status(400).json({
        success: false,
        message: 'Application ID and file type are required',
      });
    }

    // Fetch application with document metadata
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check permissions
    if (
      req.user.role === 'staff' &&
      application.applicant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Get file metadata from database
    let fileMetadata;
    if (fileType === 'cv') {
      fileMetadata = application.documents.cv;
    } else if (fileType === 'coverLetter') {
      fileMetadata = application.documents.coverLetter;
    } else if (fileType.startsWith('certificate-')) {
      const index = parseInt(fileType.split('-')[1]);
      fileMetadata = application.documents.certificates[index];
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type',
      });
    }

    if (!fileMetadata || !fileMetadata.url) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const { url, filename, mimetype } = fileMetadata;

    console.log('File metadata:', { filename, mimetype, url: url?.substring(0, 50) });

    // Ensure filename has proper extension
    let finalFilename = filename || 'document';
    
    // Check if filename already has an extension
    if (!finalFilename.includes('.')) {
      // Add extension based on mimetype if missing
      let ext = 'pdf';
      if (mimetype) {
        const mimeExt = mimetype.split('/')[1];
        // Handle common mime types
        if (mimeExt === 'vnd.openxmlformats-officedocument.wordprocessingml.document') {
          ext = 'docx';
        } else if (mimeExt === 'msword') {
          ext = 'doc';
        } else {
          ext = mimeExt;
        }
      }
      finalFilename = `${finalFilename}.${ext}`;
    }

    console.log('Final filename:', finalFilename);

    // Fetch file from Cloudinary
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 30000, // 30 second timeout
      validateStatus: (status) => status === 200, // Only accept 200 status
    });

    // Set proper headers using database metadata
    res.setHeader('Content-Type', mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${finalFilename || 'document.pdf'}"`);
    
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    // Pipe the file stream to response
    response.data.pipe(res);

    // Handle stream errors
    response.data.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to stream file',
        });
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    
    // Return clean JSON error if headers not sent
    if (!res.headersSent) {
      if (error.response?.status === 404) {
        return res.status(404).json({
          success: false,
          message: 'File not found on storage server',
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to download file',
        error: error.message,
      });
    }
  }
};
