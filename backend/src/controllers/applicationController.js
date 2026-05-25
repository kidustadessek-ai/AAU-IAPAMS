import Application from '../models/Application.js';
import Position from '../models/Position.js';
import User from '../models/User.js';
import { uploadToCloudinary } from '../utils/upload.js';
import { sendApplicationStatusUpdate, sendAdminNewApplicationNotification } from '../services/emailService.js';

// @desc    Get all applications
// @route   GET /api/v1/applications
// @access  Private
export const getApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, position, applicant, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};

    // Role-based filtering
    if (req.user.role === 'staff') {
      query.applicant = req.user._id;
    } else if (req.user.role === 'evaluator') {
      // Evaluators can see applications for positions they're assigned to
      const positions = await Position.find({ evaluators: req.user._id }).select('_id');
      query.position = { $in: positions.map(p => p._id) };
    }

    if (status) query.status = status;
    if (position) query.position = position;
    if (applicant && req.user.role === 'admin') query.applicant = applicant;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const applications = await Application.find(query)
      .populate('position', 'title department college deadline status')
      .populate('applicant', 'fullName email department phone')
      .populate('evaluations.evaluator', 'fullName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: applications,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single application
// @route   GET /api/v1/applications/:id
// @access  Private
export const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('position', 'title department deadline status requirements')
      .populate('applicant', 'fullName email department phone profilePhoto')
      .populate('evaluations.evaluator', 'fullName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check permissions
    if (
      req.user.role === 'staff' &&
      application.applicant._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create application
// @route   POST /api/v1/applications
// @access  Private
export const createApplication = async (req, res) => {
  try {
    const { positionId } = req.body;

    // Check if position exists and is open
    const position = await Position.findById(positionId);

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found',
      });
    }

    if (position.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Position is not accepting applications',
      });
    }

    if (new Date() > position.deadline) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed',
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      position: positionId,
      applicant: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this position',
      });
    }

    // Upload documents
    const documents = {};

    if (!req.files || !req.files.cv) {
      return res.status(400).json({
        success: false,
        message: 'CV is required',
      });
    }

    // Helper: upload to Cloudinary with fallback
    const uploadFile = async (buffer, folder, mimetype) => {
      try {
        return await uploadToCloudinary(buffer, folder, 'raw');
      } catch (err) {
        // Fallback: store as base64 data URL if Cloudinary fails
        const base64 = buffer.toString('base64');
        return `data:${mimetype};base64,${base64}`;
      }
    };

    documents.cv = await uploadFile(
      req.files.cv[0].buffer,
      'aau-iapams/applications/cv',
      req.files.cv[0].mimetype
    );

    if (req.files.coverLetter) {
      documents.coverLetter = await uploadFile(
        req.files.coverLetter[0].buffer,
        'aau-iapams/applications/cover-letters',
        req.files.coverLetter[0].mimetype
      );
    }

    if (req.files.certificates) {
      documents.certificates = await Promise.all(
        req.files.certificates.map(file =>
          uploadFile(file.buffer, 'aau-iapams/applications/certificates', file.mimetype)
        )
      );
    }

    // Create application
    const application = await Application.create({
      position: positionId,
      applicant: req.user._id,
      documents,
    });

    const populatedApplication = await Application.findById(application._id)
      .populate('position', 'title department deadline')
      .populate('applicant', 'fullName email department');

    // Send notification to admin (non-blocking)
    const admins = await User.find({ role: 'admin', status: 'active' });
    admins.forEach(admin => {
      sendAdminNewApplicationNotification(admin.email, populatedApplication)
        .catch(err => console.error('Admin notification failed:', err));
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: populatedApplication,
    });
  } catch (error) {
    console.error('createApplication error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit application',
    });
  }
};

// @desc    Evaluate application
// @route   POST /api/v1/applications/:id/evaluate
// @access  Private/Admin/Evaluator
export const evaluateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { scores, comments } = req.body;

    const application = await Application.findById(id).populate('position');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check if user is authorized to evaluate
    const position = application.position;
    const isEvaluator = position.evaluators.some(
      evaluatorId => evaluatorId.toString() === req.user._id.toString()
    );

    if (req.user.role !== 'admin' && !isEvaluator) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to evaluate this application',
      });
    }

    // Check if user already evaluated
    const existingEvaluation = application.evaluations.find(
      ev => ev.evaluator.toString() === req.user._id.toString()
    );

    if (existingEvaluation) {
      // Update existing evaluation
      existingEvaluation.scores = scores;
      existingEvaluation.comments = comments;
      existingEvaluation.submittedAt = new Date();
    } else {
      // Add new evaluation
      application.evaluations.push({
        evaluator: req.user._id,
        scores,
        comments,
      });
    }

    // Update status to under_review if it's pending
    if (application.status === 'pending') {
      application.status = 'under_review';
    }

    application.reviewedAt = new Date();
    await application.save();

    const updatedApplication = await Application.findById(id)
      .populate('position', 'title department')
      .populate('applicant', 'fullName email')
      .populate('evaluations.evaluator', 'fullName email');

    res.json({
      success: true,
      message: 'Evaluation submitted successfully',
      data: updatedApplication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update application status
// @route   PATCH /api/v1/applications/:id/status
// @access  Private/Admin
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    application.status = status;
    if (notes) application.notes = notes;
    application.reviewedAt = new Date();

    await application.save();

    const updatedApplication = await Application.findById(id)
      .populate('position', 'title department')
      .populate('applicant', 'fullName email');

    // Send status update email (non-blocking)
    sendApplicationStatusUpdate(updatedApplication, status)
      .catch(err => console.error('Status update email failed:', err));

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: updatedApplication,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete application
// @route   DELETE /api/v1/applications/:id
// @access  Private
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Only applicant or admin can delete
    if (
      req.user.role !== 'admin' &&
      application.applicant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Don't allow deletion if already reviewed
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete application that has been reviewed',
      });
    }

    await Application.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
