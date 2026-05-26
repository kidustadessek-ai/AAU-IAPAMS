import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, generateResetToken, verifyResetToken, verifyRefreshToken } from '../utils/token.js';
import { sendLoginNotification, sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { uploadToCloudinary } from '../utils/upload.js';

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public (or Admin only - depends on requirements)
export const register = async (req, res) => {
  try {
    const { username, email, password, fullName, role, department, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken',
      });
    }

    // Only admin can assign roles other than staff
    const assignedRole = req.user?.role === 'admin' ? (role || 'staff') : 'staff';

    console.log('Creating user with role:', assignedRole, 'Requested role:', role, 'Admin role:', req.user?.role);

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      role: assignedRole,
      department,
      phone,
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err));

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
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

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password',
      });
    }

    // Find user and include password
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive or suspended',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Send login notification (non-blocking)
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    sendLoginNotification(user, ipAddress, userAgent).catch(err => console.error('Login notification failed:', err));

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Convert socialMedia Map to plain object
    const userObj = user.toObject();
    if (userObj.socialMedia instanceof Map) {
      userObj.socialMedia = Object.fromEntries(userObj.socialMedia);
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: userObj._id,
          username: userObj.username,
          email: userObj.email,
          fullName: userObj.fullName,
          role: userObj.role,
          department: userObj.department,
          phone: userObj.phone || '',
          profilePhoto: userObj.profilePhoto || '',
          bio: userObj.bio || '',
          address: userObj.address || '',
          website: userObj.website || '',
          positionType: userObj.positionType || '',
          education: userObj.education || [],
          experience: userObj.experience || [],
          skills: userObj.skills || [],
          socialMedia: userObj.socialMedia || {},
        },
        tokens: {
          accessToken,
          refreshToken,
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

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Convert user to plain object and handle Map types
    const userObj = user.toObject();
    
    // Convert socialMedia Map to plain object
    if (userObj.socialMedia instanceof Map) {
      userObj.socialMedia = Object.fromEntries(userObj.socialMedia);
    }

    res.json({
      success: true,
      data: userObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email',
      });
    }

    // Generate reset token
    const resetToken = generateResetToken(user._id);

    // Save reset token to user (optional - for additional security)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    await sendPasswordResetEmail(email, resetToken);

    res.json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reset token and new password',
      });
    }

    // Verify token
    const decoded = verifyResetToken(resetToken);

    // Find user
    const user = await User.findById(decoded.userId).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if token matches and not expired
    if (user.resetPasswordToken !== resetToken || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const accessToken = generateAccessToken(user._id);

    res.json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
};

// @desc    Change password
// @route   PATCH /api/v1/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/v1/auth/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, role, search } = req.query;

    const query = {};

    if (status) query.status = status;
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
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

// @desc    Update user
// @route   PATCH /api/v1/auth/users/:id (Admin) or PATCH /api/v1/auth/me (Self)
// @access  Private
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    let updates = { ...req.body };

    console.log('Update request - params:', req.params);
    console.log('Update request - body:', updates);
    console.log('Update request - file:', req.file);

    // Determine which user to update
    const userId = id || req.user._id;

    // If not admin and trying to update someone else, deny
    if (id && id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user',
      });
    }

    // Don't allow password update through this route
    delete updates.password;

    // Don't allow role change unless admin
    if (req.user.role !== 'admin') {
      delete updates.role;
      delete updates.status;
    }

    // Parse JSON strings for complex fields
    ['education', 'experience', 'skills'].forEach(field => {
      console.log(`Processing field ${field}:`, updates[field], typeof updates[field]);
      if (updates[field]) {
        if (typeof updates[field] === 'string') {
          try {
            updates[field] = JSON.parse(updates[field]);
            console.log(`Parsed ${field}:`, updates[field]);
          } catch (e) {
            console.error(`Failed to parse ${field}:`, e);
            updates[field] = [];
          }
        } else if (!Array.isArray(updates[field])) {
          console.log(`${field} is not array, setting to empty`);
          updates[field] = [];
        }
      } else {
        console.log(`${field} is falsy, skipping`);
      }
    });

    // Handle socialMedia separately as it's a Map
    if (updates.socialMedia && typeof updates.socialMedia === 'string') {
      try {
        const parsed = JSON.parse(updates.socialMedia);
        updates.socialMedia = parsed;
      } catch (e) {
        console.error('Failed to parse socialMedia:', e);
        updates.socialMedia = {};
      }
    }

    // Handle profile photo upload
    if (req.file) {
      console.log('File detected, uploading to Cloudinary...');
      try {
        const photoUrl = await uploadToCloudinary(req.file.buffer, 'aau-iapams/profiles', 'image');
        console.log('Photo uploaded successfully:', photoUrl);
        updates.profilePhoto = photoUrl;
      } catch (error) {
        console.error('Failed to upload photo:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload profile photo: ' + error.message,
        });
      }
    } else {
      console.log('No file in request');
    }

    console.log('Updating user with ID:', userId);
    console.log('Updates to apply:', JSON.stringify(updates, null, 2));

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log('User updated successfully');
    console.log('Updated user data:', JSON.stringify(user, null, 2));

    // Convert user to plain object and handle Map types
    const userObj = user.toObject();
    
    // Convert socialMedia Map to plain object
    if (userObj.socialMedia instanceof Map) {
      userObj.socialMedia = Object.fromEntries(userObj.socialMedia);
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: userObj,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete users
// @route   DELETE /api/v1/auth/users
// @access  Private/Admin
export const deleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;
    const password = req.headers['x-delete-password'];

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user IDs to delete',
      });
    }

    // Verify admin password
    const admin = await User.findById(req.user._id).select('+password');
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }

    // Prevent deleting self
    if (ids.includes(req.user._id.toString())) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    await User.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${ids.length} user(s) deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
