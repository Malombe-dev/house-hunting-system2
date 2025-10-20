// server/src/routes/properties.js
const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { protect: authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');
const { uploadMultiple } = require('../middleware/upload');

// =====================================================
// PUBLIC ROUTES (must be before parameterized routes)
// =====================================================

// @route   GET /api/properties/search
// @desc    Search properties
// @access  Public
router.get('/search', propertyController.searchProperties);

// @route   GET /api/properties
// @desc    Get all properties (with filters)
// @access  Public
router.get('/', propertyController.getProperties);

// =====================================================
// PRIVATE ROUTES - APPROVAL MANAGEMENT
// =====================================================

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

// @route   GET /api/properties/company-properties
// @desc    Get all properties for agent's company (agent + employees)
// @access  Private (Agent/Landlord/Employee)
router.get(
  '/company-properties',
  authenticateToken,
  authorizeRoles('agent', 'landlord', 'employee'),
  propertyController.getCompanyProperties
);

// =====================================================
// 🆕 UNIT MANAGEMENT ROUTES (must be before /:id routes)
// =====================================================

// @route   POST /api/properties/:id/units
// @desc    Add units to a property
// @access  Private (Agent/Employee/Admin)
router.post(
  '/:id/units',
  authenticateToken,
  authorizeRoles('agent', 'employee', 'admin'),
  propertyController.addUnits
);

// @route   POST /api/properties/:id/units/bulk
// @desc    Bulk add units to a property
// @access  Private (Agent/Admin)
router.post(
  '/:id/units/bulk',
  authenticateToken,
  authorizeRoles('agent', 'admin'),
  propertyController.bulkAddUnits
);

// @route   GET /api/properties/:id/units
// @desc    Get all units for a property
// @access  Public
router.get('/:id/units', propertyController.getPropertyUnits);

// @route   GET /api/properties/:id/available-units
// @desc    Get available units for a property
// @access  Public
router.get('/:id/available-units', propertyController.getAvailableUnits);

// @route   GET /api/properties/:id/units/stats
// @desc    Get unit statistics
// @access  Private (Agent/Employee/Admin)
router.get(
  '/:id/units/stats',
  authenticateToken,
  authorizeRoles('agent', 'employee', 'admin'),
  propertyController.getUnitStats
);

// @route   PATCH /api/properties/:id/units/:unitId
// @desc    Update a specific unit
// @access  Private (Agent/Employee/Admin)
router.patch(
  '/:id/units/:unitId',
  authenticateToken,
  authorizeRoles('agent', 'employee', 'admin'),
  propertyController.updateUnit
);

// @route   DELETE /api/properties/:id/units/:unitId
// @desc    Delete a unit
// @access  Private (Agent/Admin)
router.delete(
  '/:id/units/:unitId',
  authenticateToken,
  authorizeRoles('agent', 'admin'),
  propertyController.deleteUnit
);

// @route   PATCH /api/properties/:id/units/:unitId/occupy
// @desc    Mark unit as occupied
// @access  Private (Agent/Employee/Admin)
router.patch(
  '/:id/units/:unitId/occupy',
  authenticateToken,
  authorizeRoles('agent', 'employee', 'admin'),
  propertyController.occupyUnit
);

// @route   PATCH /api/properties/:id/units/:unitId/vacate
// @desc    Mark unit as vacant
// @access  Private (Agent/Employee/Admin)
router.patch(
  '/:id/units/:unitId/vacate',
  authenticateToken,
  authorizeRoles('agent', 'employee', 'admin'),
  propertyController.vacateUnit
);

// =====================================================
// PROPERTY APPROVAL ROUTES
// =====================================================

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

// =====================================================
// PUBLIC PROPERTY ROUTES
// =====================================================

// @route   GET /api/properties/agent/:agentId
// @desc    Get properties by agent
// @access  Public
router.get('/agent/:agentId', propertyController.getPropertiesByAgent);

// @route   GET /api/properties/:id
// @desc    Get property by ID
// @access  Public
router.get('/:id', propertyController.getPropertyById);

// =====================================================
// PROPERTY CRUD ROUTES
// =====================================================

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