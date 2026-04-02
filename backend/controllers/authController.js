const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Public registration is for students only.
    // Faculty and admin accounts must be created by an admin.
    const user = await User.create({
      name: name || '',
      email,
      password,
      role: 'student',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user email
    const user = await User.findOne({ email });

    // Match password using the User schema method
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile data to test token authorization
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  // req.user is populated dynamically by the protect middleware
  res.json({
    _id: req.user._id,
    email: req.user.email,
    role: req.user.role,
    message: 'You have successfully accessed a protected route!'
  });
};

// @desc    Create admin, faculty, or student user
// @route   POST /api/auth/create-user
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please provide email, password and role' });
    }

    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be student, faculty or admin' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name: name || '', email, password, role });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: 'User created successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a user and all related data
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const Student    = require('../models/Student');
    const Batch      = require('../models/Batch');
    const Attendance = require('../models/Attendance');
    const Mark       = require('../models/Mark');
    const Material   = require('../models/Material');
    const Schedule   = require('../models/Schedule');
    const Test       = require('../models/Test');

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    if (user.role === 'student') {
      // Remove student record and their attendance/marks
      await Attendance.deleteMany({ studentId: user._id });
      await Mark.deleteMany({ studentId: user._id });
      await Student.deleteMany({ userId: user._id });
    }

    if (user.role === 'faculty') {
      // Find all batches assigned to this faculty
      const batches = await Batch.find({ facultyId: user._id }).select('_id');
      const batchIds = batches.map(b => b._id);

      if (batchIds.length) {
        const schedules = await Schedule.find({ batchId: { $in: batchIds } }).select('_id');
        const scheduleIds = schedules.map(s => s._id);

        const tests = await Test.find({ batchId: { $in: batchIds } }).select('_id');
        const testIds = tests.map(t => t._id);

        if (scheduleIds.length) await Attendance.deleteMany({ scheduleId: { $in: scheduleIds } });
        if (testIds.length)     await Mark.deleteMany({ testId: { $in: testIds } });

        await Schedule.deleteMany({ batchId: { $in: batchIds } });
        await Test.deleteMany({ batchId: { $in: batchIds } });
        await Material.deleteMany({ batchId: { $in: batchIds } });
        await Student.deleteMany({ batchId: { $in: batchIds } });
        await Batch.deleteMany({ facultyId: user._id });
      }
    }

    await user.deleteOne();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Forgot password — generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide your email' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    const resetToken = user.getResetToken();
    await user.save({ validateBeforeSave: false });

    // In a real app you would email this link. For project demo we return it directly.
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    res.status(200).json({
      message: 'Reset token generated',
      resetUrl, // frontend will use this to build the link
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Change password (logged in user)
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a user (name, email, role, optional password)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, role, password } = req.body;

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }
    if (name !== undefined) user.name = name;
    if (role && ['student', 'faculty', 'admin'].includes(role)) user.role = role;
    if (password && password.length >= 6) user.password = password;

    await user.save();
    res.status(200).json({ message: 'User updated successfully', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
