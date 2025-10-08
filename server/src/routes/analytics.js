// server/src/routes/analytics.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const {protect: authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', authenticateToken, analyticsController.getDashboardAnalytics);

// @route   GET /api/analytics/revenue
// @desc    Get revenue analytics
// @access  Private/Agent/Admin
router.get('/revenue', authenticateToken, authorizeRoles('agent', 'admin'), analyticsController.getRevenueAnalytics);

// @route   GET /api/analytics/occupancy
// @desc    Get occupancy analytics
// @access  Private/Agent/Admin
router.get('/occupancy', authenticateToken, authorizeRoles('agent', 'admin'), analyticsController.getOccupancyAnalytics);

module.exports = router;