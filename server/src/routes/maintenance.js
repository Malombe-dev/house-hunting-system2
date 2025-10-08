// server/src/routes/maintenance.js
const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const {protect: authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');
const { uploadMultiple } = require('../middleware/upload');


// @route   GET /api/maintenance
// @desc    Get all maintenance requests
// @access  Private
router.get('/', authenticateToken, maintenanceController.getAllRequests);

// @route   GET /api/maintenance/stats
// @desc    Get maintenance statistics
// @access  Private/Agent/Admin
router.get('/stats', authenticateToken, authorizeRoles('agent', 'admin'), maintenanceController.getMaintenanceStats);

// @route   GET /api/maintenance/:id
// @desc    Get maintenance request by ID
// @access  Private
router.get('/:id', authenticateToken, maintenanceController.getRequestById);

// @route   POST /api/maintenance
// @desc    Create maintenance request
// @access  Private
router.post('/', authenticateToken, uploadMultiple('images', 5), maintenanceController.createRequest);

// @route   PUT /api/maintenance/:id
// @desc    Update maintenance request
// @access  Private/Agent/Admin
router.put('/:id', authenticateToken, authorizeRoles('agent', 'admin'), maintenanceController.updateRequest);

// @route   PUT /api/maintenance/:id/assign
// @desc    Assign maintenance request
// @access  Private/Agent/Admin
router.put('/:id/assign', authenticateToken, authorizeRoles('agent', 'admin'), maintenanceController.assignRequest);

// @route   PUT /api/maintenance/:id/complete
// @desc    Complete maintenance request
// @access  Private/Agent/Admin
router.put('/:id/complete', authenticateToken, authorizeRoles('agent', 'admin'), uploadMultiple('completionImages', 5), maintenanceController.completeRequest);

// @route   DELETE /api/maintenance/:id
// @desc    Delete maintenance request
// @access  Private/Admin
router.delete('/:id', authenticateToken, authorizeRoles('admin'), maintenanceController.deleteRequest);

module.exports = router;