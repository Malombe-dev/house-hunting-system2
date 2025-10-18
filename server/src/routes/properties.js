// server/src/routes/properties.js
const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { protect: authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');
const { uploadMultiple } = require('../middleware/upload');

// Public routes (must be before parameterized routes)
// @route   GET /api/properties/search
// @desc    Search properties
// @access  Public
router.get('/search', propertyController.searchProperties);

// @route   GET /api/properties
// @desc    Get all properties (with filters)
// @access  Public
router.get('/', propertyController.getProperties);

// Private routes - Approval management
// @route   GET /api/properties/pending
// @desc    Get all pending properties for approval
// @access  Private (Agent/Admin only)
router.get(
  '/pending',
  authenticateToken,
  authorizeRoles('agent', 'admin'),
  propertyController.getPendingProperties
);

// @route   GET /api/properties/my-properties
// @desc    Get current user's properties
// @access  Private
router.get(
  '/my-properties',
  authenticateToken,
  propertyController.getMyProperties
);

// @route   PATCH /api/properties/:id/approve
// @desc    Approve a property
// @access  Private (Agent/Admin only)
router.patch(
  '/:id/approve',
  authenticateToken,
  authorizeRoles('agent', 'admin'),
  propertyController.approveProperty
);

// @route   PATCH /api/properties/:id/reject
// @desc    Reject a property
// @access  Private (Agent/Admin only)
router.patch(
  '/:id/reject',
  authenticateToken,
  authorizeRoles('agent', 'admin'),
  propertyController.rejectProperty
);

// Public route for specific agent
// @route   GET /api/properties/agent/:agentId
// @desc    Get properties by agent
// @access  Public
router.get('/agent/:agentId', propertyController.getPropertiesByAgent);
// server/src/routes/properties.js - Add this route

// @route   GET /api/properties/company-properties
// @desc    Get all properties for agent's company (agent + employees)
// @access  Private/Agent
router.get(
  '/company-properties',
  authenticateToken,
  authorizeRoles('agent', 'landlord','employee'),
  propertyController.getCompanyProperties
);

// @route   GET /api/properties/:id
// @desc    Get property by ID
// @access  Public
router.get('/:id', propertyController.getPropertyById);

// @route   POST /api/properties
// @desc    Create new property
// @access  Private (Agent/Employee/Admin)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('agent', 'employee', 'admin'),
  uploadMultiple('images', 10),
  propertyController.createProperty
);

// @route   PATCH /api/properties/:id
// @desc    Update property
// @access  Private (Agent/Employee/Admin)
router.patch(
  '/:id',
  authenticateToken,
  authorizeRoles('agent', 'employee', 'admin'),
  uploadMultiple('images', 10),
  propertyController.updateProperty
);

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private (Agent/Admin only)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('agent', 'admin'),
  propertyController.deleteProperty
);

module.exports = router;