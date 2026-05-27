import axios from 'axios';

// @desc    Download file from Cloudinary
// @route   GET /api/v1/download
// @access  Private
export const downloadFile = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'File URL is required',
      });
    }

    // For Cloudinary URLs, add fl_attachment flag
    let downloadUrl = url;
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
    }

    // Fetch the file from Cloudinary
    const response = await axios.get(downloadUrl, {
      responseType: 'stream',
    });

    // Extract filename from URL
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1].split('?')[0];

    // Set headers for download
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', response.headers['content-length']);

    // Pipe the file stream to response
    response.data.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
    });
  }
};
