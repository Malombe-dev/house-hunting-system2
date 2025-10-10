// server/src/routes/hierarchy.js
const express = require('express');
const router = express.Router();
const hierarchyController = require('../controllers/hierarchyController');
const {protect: authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');

// @route   GET /api/hierarchy/agents
// @desc    Get complete agent hierarchy (Admin only)
// @access  Private/Admin
router.get(
  '/agents',
  authenticateToken,
  authorizeRoles('admin'),
  hierarchyController.getAgentHierarchy
);

// @route   GET /api/hierarchy/agent/:agentId
// @desc    Get specific agent details with their team
// @access  Private/Admin or Own Agent
router.get(
  '/agent/:agentId',
  authenticateToken,
  hierarchyController.getAgentDetails
);

// @route   GET /api/hierarchy/employee/:employeeId
// @desc    Get employee statistics
// @access  Private/Admin or Parent Agent
router.get(
  '/employee/:employeeId',
  authenticateToken,
  hierarchyController.getEmployeeStats
);

// @route   GET /api/hierarchy/billing
// @desc    Get billing summary for all agents
// @access  Private/Admin
router.get(
  '/billing',
  authenticateToken,
  authorizeRoles('admin'),
  hierarchyController.getBillingSummary
);

module.exports = router;