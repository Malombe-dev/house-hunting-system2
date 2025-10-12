// server/src/controllers/authController.js
const User = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// exports.login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     // Validate email & password
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide email and password'
//       });
//     }

//     // Check for user and explicitly select password
//     const user = await User.findOne({ email }).select('+password');
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     // Check if password matches
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     // Check if user is active
//     if (!user.isActive) {
//       return res.status(401).json({
//         success: false,
//         message: 'Account has been deactivated'
//       });
//     }

//     // **CRITICAL FIX**: Check if user must change password (first-time login)
//     if (user.mustChangePassword) {
//       // Generate TEMPORARY token for password change only
//       const tempToken = jwt.sign(
//         { 
//           userId: user._id, 
//           purpose: 'password_change',
//           type: 'temporary' 
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: '15m' } // Short expiration - 15 minutes
//       );

//       return res.status(200).json({
//         success: true,
//         requiresPasswordChange: true,
//         message: 'First login detected. Please change your password.',
//         data: {
//           requiresPasswordChange: true,
//           user: {
//             id: user._id,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             email: user.email,
//             role: user.role,
//             verified: user.verified,
//             avatar: user.avatar
//           },
//           tempToken: tempToken
//         }
//       });
//     }

//     // Update last login
//     user.lastLogin = Date.now();
//     await user.save();

//     // Generate token for regular login
//     const token = user.generateAuthToken();

//     res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       data: {
//         user: {
//           id: user._id,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           email: user.email,
//           role: user.role,
//           verified: user.verified,
//           avatar: user.avatar
//         },
//         token
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     next(error);
//   }
// };
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 BACKEND LOGIN ATTEMPT ======================');
    console.log('📧 Email received:', email);

    // Check for user - MUST INCLUDE PASSWORD (critical!)
    console.log('👤 Searching for user with email (including password):', email);
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ USER NOT FOUND for email:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }
    
    console.log('✅ USER FOUND:');
    console.log('   - ID:', user._id);
    console.log('   - Email:', user.email);
    console.log('   - Name:', user.firstName, user.lastName);
    console.log('   - Role:', user.role);
    console.log('   - mustChangePassword:', user.mustChangePassword);
    console.log('   - isActive:', user.isActive);
    console.log('   - Password field exists:', !!user.password);
    console.log('   - Password length:', user.password?.length);

    // Check if password matches
    console.log('🔑 Comparing passwords...');
    const isMatch = await user.comparePassword(password);
    console.log('🔑 Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('❌ PASSWORD MISMATCH for user:', user.email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ USER ACCOUNT INACTIVE:', user.email);
      return res.status(401).json({
        status: 'error',
        message: 'Account has been deactivated'
      });
    }

    console.log('✅ ALL CHECKS PASSED for user:', user.email);

    // Check if user must change password (first-time login)
    if (user.mustChangePassword) {
      console.log('🔐 FIRST LOGIN DETECTED - generating temp token');
      
      // Generate TEMPORARY token for password change only
      const tempToken = jwt.sign(
        { 
          userId: user._id, 
          purpose: 'password_change',
          type: 'temporary' 
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      console.log('✅ TEMP TOKEN GENERATED, length:', tempToken.length);
      
      // Create user response WITHOUT password
      const userResponse = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        verified: user.verified,
        avatar: user.avatar
      };
      
      return res.status(200).json({
        status: 'success',
        message: 'First login detected. Please change your password.',
        data: {
          requiresPasswordChange: true,
          user: userResponse,
          tempToken: tempToken
        }
      });
    }

    // Regular login flow
    console.log('🔄 REGULAR LOGIN - updating last login');
    user.lastLogin = Date.now();
    await user.save();

    // Generate token for regular login
    const token = user.generateAuthToken();
    console.log('✅ REGULAR TOKEN GENERATED');

    // Create user response WITHOUT password
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      verified: user.verified,
      avatar: user.avatar
    };

    console.log('🎉 LOGIN SUCCESSFUL for:', user.email);
    console.log('============================================\n');

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('💥 BACKEND LOGIN ERROR:', error);
    next(error);
  }
};

// @desc    Change password for first-time login
// @route   POST /api/auth/first-login-change-password
// @access  Public (but requires temporary token from login)
exports.firstLoginChangePassword = async (req, res, next) => {
  try {
    const { tempToken, newPassword } = req.body;

    if (!tempToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Temporary token and new password are required'
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Verify the temporary token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Password change token has expired. Please login again.'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Check if token has the correct purpose
    if (decoded.purpose !== 'password_change' || decoded.type !== 'temporary') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Find user using the userId from the token
    const user = await User.findById(decoded.userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user actually requires password change
    if (!user.mustChangePassword) {
      return res.status(400).json({
        success: false,
        message: 'Password has already been changed'
      });
    }

    // Update password and clear the flag
    user.password = newPassword;
    user.mustChangePassword = false;
    user.lastLogin = Date.now();
    await user.save();

    // Generate proper access token (full permissions)
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          verified: user.verified,
          avatar: user.avatar
        },
        token
      }
    });
  } catch (error) {
    console.error('First login password change error:', error);
    next(error);
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: role || 'seeker',
      mustChangePassword: false // Regular registrations don't need password change
    });

    // Generate token
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          verified: user.verified
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to email'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;