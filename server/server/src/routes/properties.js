// server/src/routes/properties.js
const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');
const upload = require('../middleware/upload');

// @route   GET /api/properties
// @desc    Get all properties
// @access  Public
router.get('/', propertyController.getAllProperties);

// @route   GET /api/properties/:id
// @desc    Get property by ID
// @access  Public
router.get('/:id', propertyController.getPropertyById);

// @route   POST /api/properties
// @desc    Create new property
// @access  Private/Agent/Admin
router.post(
  '/',
  authenticateToken,
  authorizeRoles('agent', 'admin'),
  upload.array('images', 10),
  propertyController.createProperty
);

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private/Agent/Admin
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('agent', 'admin'),
  upload.array('images', 10),
  propertyController.updateProperty
);

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private/Agent/Admin
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('agent', 'admin'),
  propertyController.deleteProperty
);

// @route   GET /api/properties/search
// @desc    Search properties
// @access  Public
router.get('/search', propertyController.searchProperties);

// @route   GET /api/properties/agent/:agentId
// @desc    Get properties by agent
// @access  Public
router.get('/agent/:agentId', propertyController.getPropertiesByAgent);

module.exports = router;