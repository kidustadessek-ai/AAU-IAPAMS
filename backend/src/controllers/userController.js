import User from '../models/User.js';
import Application from '../models/Application.js';
import Position from '../models/Position.js';

// @desc    Get user statistics
// @route   GET /api/v1/users/stats
// @access  Private/Admin
export const getUserStats = async (req, res) => {
  try {
    // Total users by role
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const staffCount = await User.countDocuments({ role: 'staff' });
    const evaluatorCount = await User.countDocuments({ role: 'evaluator' });

    // Active vs inactive users
    const activeUsers = await User.countDocuments({ status: 'active' });
    const inactiveUsers = await User.countDocuments({ status: 'inactive' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });

    // Total positions
    const totalPositions = await Position.countDocuments();
    const openPositions = await Position.countDocuments({ status: 'open' });
    const closedPositions = await Position.countDocuments({ status: 'closed' });
    const filledPositions = await Position.countDocuments({ status: 'filled' });

    // Total applications
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const underReviewApplications = await Application.countDocuments({ status: 'under_review' });
    const shortlistedApplications = await Application.countDocuments({ status: 'shortlisted' });
    const rejectedApplications = await Application.countDocuments({ status: 'rejected' });
    const acceptedApplications = await Application.countDocuments({ status: 'accepted' });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Applications by department
    const applicationsByDepartment = await Position.aggregate([
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'position',
          as: 'applications',
        },
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: { $size: '$applications' } },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Applications over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const applicationsOverTime = await Application.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          byRole: {
            admin: adminCount,
            staff: staffCount,
            evaluator: evaluatorCount,
          },
          byStatus: {
            active: activeUsers,
            inactive: inactiveUsers,
            suspended: suspendedUsers,
          },
          recentRegistrations,
        },
        positions: {
          total: totalPositions,
          open: openPositions,
          closed: closedPositions,
          filled: filledPositions,
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          underReview: underReviewApplications,
          shortlisted: shortlistedApplications,
          rejected: rejectedApplications,
          accepted: acceptedApplications,
          byDepartment: applicationsByDepartment,
          overTime: applicationsOverTime,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user dashboard stats (for individual users)
// @route   GET /api/v1/users/dashboard
// @access  Private
export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'staff') {
      // Staff dashboard
      const myApplications = await Application.countDocuments({ applicant: userId });
      const pendingApplications = await Application.countDocuments({
        applicant: userId,
        status: 'pending',
      });
      const underReviewApplications = await Application.countDocuments({
        applicant: userId,
        status: 'under_review',
      });
      const shortlistedApplications = await Application.countDocuments({
        applicant: userId,
        status: 'shortlisted',
      });

      const recentApplications = await Application.find({ applicant: userId })
        .populate('position', 'title department deadline status')
        .sort({ createdAt: -1 })
        .limit(5);

      stats = {
        applications: {
          total: myApplications,
          pending: pendingApplications,
          underReview: underReviewApplications,
          shortlisted: shortlistedApplications,
        },
        recentApplications,
      };
    } else if (userRole === 'evaluator') {
      // Evaluator dashboard
      const assignedPositions = await Position.find({ evaluators: userId });
      const positionIds = assignedPositions.map(p => p._id);

      const applicationsToReview = await Application.countDocuments({
        position: { $in: positionIds },
        status: { $in: ['pending', 'under_review'] },
      });

      const myEvaluations = await Application.countDocuments({
        'evaluations.evaluator': userId,
      });

      const pendingEvaluations = await Application.find({
        position: { $in: positionIds },
        'evaluations.evaluator': { $ne: userId },
        status: { $in: ['pending', 'under_review'] },
      })
        .populate('position', 'title department')
        .populate('applicant', 'fullName email')
        .limit(10);

      stats = {
        positions: assignedPositions.length,
        applicationsToReview,
        evaluationsCompleted: myEvaluations,
        pendingEvaluations,
      };
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
