// server/src/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get all users with filters
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 50 } = req.query;

    // Build filter query
    const filter = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (status) {
      filter.isActive = status === 'active';
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('createdBy', 'firstName lastName email role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('createdBy', 'firstName lastName email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, city, state, country } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (city) user.city = city;
    if (state) user.state = state;
    if (country) user.country = country;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        country: user.country
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

/**
 * @desc    Create agent or landlord account
 * @route   POST /api/users/create-agent
 * @access  Private/Admin
 */
exports.createAgent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      role, // 'agent' or 'landlord'
      address,
      city,
      state,
      country,
      agencyName,
      licenseNumber
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (!['agent', 'landlord'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either agent or landlord'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Create user with PLAIN TEXT password - let the pre-save hook hash it
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: tempPassword, // Let the pre-save hook handle hashing
      role,
      address,
      city,
      state,
      country,
      agencyName,
      licenseNumber,
      createdBy: req.user._id,
      isActive: true,
      emailVerified: false,
      mustChangePassword: true // Force password change on first login
    });

    console.log('✅ User created with temp password:', tempPassword);
    console.log('🔑 Stored hash:', user.password);

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        tempPassword // Remove in production, send via email
      }
    });
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create agent account',
      error: error.message
    });
  }
};
/**
 * @desc    Create employee account
 * @route   POST /api/users/create-employee
 * @access  Private/Agent/Landlord
 */
exports.createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      branch,
      salary,
      address,
      permissions // ← ADD THIS: Accept permissions from request body
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Create employee with permissions
    const employee = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: tempPassword, // Let pre-save hook handle hashing
      role: 'employee',
      jobTitle,
      branch,
      salary,
      address,
      permissions: permissions || { // ← ADD THIS: Save permissions to database
        canCreateTenants: false,
        canViewReports: false,
        canManageProperties: false,
        canHandlePayments: false
      },
      createdBy: req.user._id,
      isActive: true,
      emailVerified: false,
      mustChangePassword: true // ← ADD THIS: Force password change on first login
    });

    console.log('✅ Employee created with temp password:', tempPassword);
    console.log('🔐 Employee permissions:', employee.permissions);

    res.status(201).json({
      success: true,
      message: 'Employee account created successfully',
      employee: {
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        jobTitle: employee.jobTitle,
        branch: employee.branch,
        permissions: employee.permissions, // ← ADD THIS: Return permissions in response
        tempPassword // Remove in production
      }
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee account',
      error: error.message
    });
  }
};

/**
 * @desc    Get all employees created by current user
 * @route   GET /api/users/my-employees
 * @access  Private/Agent/Landlord
 */
exports.getMyEmployees = async (req, res) => {
  try {
    const employees = await User.find({
      createdBy: req.user._id,
      role: 'employee'
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: employees.length,
      employees: employees.map(emp => ({
        _id: emp._id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        jobTitle: emp.jobTitle,
        branch: emp.branch,
        permissions: emp.permissions, // ← ADD THIS
        isActive: emp.isActive,
        createdAt: emp.createdAt
      }))
    });
  } catch (error) {
    console.error('Get my employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message
    });
  }
};

/**
 * @desc    Update user status (activate/deactivate)
 * @route   PUT /api/users/:id/status
 * @access  Private/Admin
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const validRoles = ['admin', 'agent', 'landlord', 'employee', 'tenant', 'seeker'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};

/**
 * @desc    Update user (Admin can update any user, Agent can update their employees)
 * @route   PUT /api/users/:id
 * @access  Private/Admin/Agent
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      branch,
      salary,
      address,
      city,
      state,
      country,
      permissions,
      isActive
    } = req.body;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Authorization check
    // Admin can update any user
    // Agent can only update their own employees
    if (req.user.role === 'agent') {
      // Check if the user being updated is an employee created by this agent
      if (user.role !== 'employee' || user.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this user'
        });
      }
    }

    // Landlord can only update their own employees
    if (req.user.role === 'landlord') {
      if (user.role !== 'employee' || user.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this user'
        });
      }
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      user.email = email;
    }

    // Update allowed fields based on user role
    const allowedUpdates = {};
    
    // Basic info that agents/admins can update
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    
    // Employee-specific fields (only for employees and by their creators)
    if (user.role === 'employee') {
      if (jobTitle !== undefined) user.jobTitle = jobTitle;
      if (branch !== undefined) user.branch = branch;
      if (salary !== undefined) user.salary = salary;
      if (permissions) user.permissions = { ...user.permissions, ...permissions };
    }

    // Additional fields that only admin can update
    if (req.user.role === 'admin') {
      if (address !== undefined) user.address = address;
      if (city !== undefined) user.city = city;
      if (state !== undefined) user.state = state;
      if (country !== undefined) user.country = country;
      
      // Only admin can activate/deactivate users
      if (isActive !== undefined) user.isActive = isActive;
    }

    // Save updated user
    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(id)
      .select('-password')
      .populate('createdBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};
/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

/**
 * @desc    Verify email
 * @route   POST /api/users/verify-email
 * @access  Public
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // TODO: Implement email verification logic
    // This would typically involve:
    // 1. Decode/verify the token
    // 2. Find user by token
    // 3. Mark email as verified
    // 4. Clear verification token

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email',
      error: error.message
    });
  }
};

/**
 * @desc    Resend verification email
 * @route   POST /api/users/resend-verification
 * @access  Private
 */
exports.resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // TODO: Generate new verification token and send email
    // await sendVerificationEmail(user.email, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
      error: error.message
    });
  }
};

module.exports = exports;