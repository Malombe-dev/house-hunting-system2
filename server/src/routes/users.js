// server/src/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {protect: authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');


// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, userController.getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, userController.updateProfile);

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticateToken, userController.changePassword);

// @route   POST /api/users/create-agent
// @desc    Create agent/landlord account (Admin only)
// @access  Private/Admin
router.post('/create-agent', authenticateToken, authorizeRoles('admin'), userController.createAgent);

// @route   POST /api/users/create-employee
// @desc    Create employee account (Agent/Landlord only)
// @access  Private/Agent/Landlord
router.post('/create-employee', authenticateToken, authorizeRoles('agent', 'landlord'), userController.createEmployee);

// @route   GET /api/users/my-employees
// @desc    Get all employees created by current user
// @access  Private/Agent/Landlord
router.get('/my-employees', authenticateToken, authorizeRoles('agent', 'landlord'), userController.getMyEmployees);

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', authenticateToken, authorizeRoles('admin'), userController.getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private/Admin
router.get('/:id', authenticateToken, authorizeRoles('admin'), userController.getUserById);

// @route   PUT /api/users/:id/status
// @desc    Update user status (Admin only)
// @access  Private/Admin
router.put('/:id/status', authenticateToken, authorizeRoles('admin'), userController.updateUserStatus);

// @route   PUT /api/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private/Admin
router.put('/:id/role', authenticateToken, authorizeRoles('admin'), userController.updateUserRole);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete('/:id', authenticateToken, authorizeRoles('admin'), userController.deleteUser);

// Add this route to server/src/routes/users.js
// @route   PUT /api/users/:id
// @desc    Update user (Admin can update any user, Agent can update their employees)
// @access  Private/Admin/Agent/Landlord
router.put(
    '/:id',
    authenticateToken,
    authorizeRoles('admin', 'agent', 'landlord'),
    userController.updateUser
  );
router.post('/verify-email', userController.verifyEmail);

router.post('/resend-verification', authenticateToken, userController.resendVerification);

module.exports = router;