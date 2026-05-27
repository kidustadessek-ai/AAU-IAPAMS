import Position from '../models/Position.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import { sendEvaluatorAssignment } from '../services/emailService.js';

// @desc    Get all positions
// @route   GET /api/v1/positions
// @access  Public
export const getPositions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, department, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};

    // Hide draft positions from non-admin users
    if (!req.user || req.user.role !== 'admin') {
      query.status = { $ne: 'draft' };
    }

    if (status) query.status = status;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const positions = await Position.find(query)
      .populate('createdBy', 'fullName email')
      .populate('evaluators', 'fullName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const total = await Position.countDocuments(query);

    res.json({
      success: true,
      data: positions,
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

// @desc    Get single position
// @route   GET /api/v1/positions/:id
// @access  Public
export const getPosition = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id)
      .populate('createdBy', 'fullName email department')
      .populate('evaluators', 'fullName email');

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found',
      });
    }

    // Check if deadline passed and auto-close
    if (position.checkDeadline()) {
      await position.save();
    }

    // Get application count
    const applicationCount = await Application.countDocuments({ position: position._id });

    res.json({
      success: true,
      data: {
        ...position.toObject(),
        applicationCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new position
// @route   POST /api/v1/positions/create
// @access  Private/Admin
export const createPosition = async (req, res) => {
  try {
    const { title, description, college, department, positionType, requirements, deadline, numberOfPositions, evaluators } = req.body;

    const position = await Position.create({
      title,
      description,
      college,
      department,
      positionType,
      requirements: Array.isArray(requirements) ? requirements : [],
      deadline,
      numberOfPositions,
      evaluators: evaluators || [],
      createdBy: req.user._id,
    });

    const populatedPosition = await Position.findById(position._id)
      .populate('createdBy', 'fullName email')
      .populate('evaluators', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Position created successfully',
      data: populatedPosition,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update position
// @route   PATCH /api/v1/positions/:id
// @access  Private/Admin
export const updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const position = await Position.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('createdBy', 'fullName email')
      .populate('evaluators', 'fullName email');

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found',
      });
    }

    // If evaluators were updated, send notifications
    if (updates.evaluators && Array.isArray(updates.evaluators)) {
      const applicationsCount = await Application.countDocuments({ position: id });
      position.evaluators.forEach(evaluator => {
        sendEvaluatorAssignment(evaluator, position, applicationsCount)
          .catch(err => console.error('Evaluator notification failed:', err));
      });
    }

    res.json({
      success: true,
      message: 'Position updated successfully',
      data: position,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Close position applications
// @route   PATCH /api/v1/positions/:id/close
// @access  Private/Admin
export const closePosition = async (req, res) => {
  try {
    const { id } = req.params;

    const position = await Position.findById(id);

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found',
      });
    }

    position.status = 'closed';
    await position.save();

    res.json({
      success: true,
      message: 'Position closed successfully',
      data: position,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete position
// @route   DELETE /api/v1/positions/:id
// @access  Private/Admin
export const deletePosition = async (req, res) => {
  try {
    const { id } = req.params;

    const position = await Position.findById(id);

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position not found',
      });
    }

    // Delete all applications associated with this position
    await Application.deleteMany({ position: id });

    // Delete the position
    await Position.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Position and associated applications deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
