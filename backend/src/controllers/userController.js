import User from '../models/User.js';
import Application from '../models/Application.js';
import Position from '../models/Position.js';

// @desc    Get user statistics
// @route   GET /api/v1/users/stats
// @access  Private/Admin
export const getUserStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [userStats, positionStats, applicationStats, applicationsByDepartment, applicationsOverTime] =
      await Promise.all([
        User.aggregate([
          {
            $facet: {
              byRole: [{ $group: { _id: '$role', count: { $sum: 1 } } }],
              byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
              recent: [{ $match: { createdAt: { $gte: thirtyDaysAgo } } }, { $count: 'count' }],
            },
          },
        ]),
        Position.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Application.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Position.aggregate([
          { $lookup: { from: 'applications', localField: '_id', foreignField: 'position', as: 'applications' } },
          { $group: { _id: '$department', count: { $sum: { $size: '$applications' } } } },
          { $sort: { count: -1 } },
        ]),
        Application.aggregate([
          { $match: { createdAt: { $gte: sixMonthsAgo } } },
          { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
      ]);

    const toMap = (arr) => arr.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});

    const roleMap = toMap(userStats[0].byRole);
    const statusMap = toMap(userStats[0].byStatus);
    const posMap = toMap(positionStats);
    const appMap = toMap(applicationStats);

    res.json({
      success: true,
      data: {
        users: {
          total: Object.values(roleMap).reduce((a, b) => a + b, 0),
          byRole: { admin: roleMap.admin || 0, staff: roleMap.staff || 0, evaluator: roleMap.evaluator || 0 },
          byStatus: { active: statusMap.active || 0, inactive: statusMap.inactive || 0, suspended: statusMap.suspended || 0 },
          recentRegistrations: userStats[0].recent[0]?.count || 0,
        },
        positions: {
          total: Object.values(posMap).reduce((a, b) => a + b, 0),
          open: posMap.open || 0,
          closed: posMap.closed || 0,
          filled: posMap.filled || 0,
        },
        applications: {
          total: Object.values(appMap).reduce((a, b) => a + b, 0),
          pending: appMap.pending || 0,
          underReview: appMap.under_review || 0,
          shortlisted: appMap.shortlisted || 0,
          interviewScheduled: appMap.interview_scheduled || 0,
          rejected: appMap.rejected || 0,
          accepted: appMap.accepted || 0,
          byDepartment: applicationsByDepartment,
          overTime: applicationsOverTime,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      const interviewScheduledApplications = await Application.countDocuments({
        applicant: userId,
        status: 'interview_scheduled',
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
          interviewScheduled: interviewScheduledApplications,
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
