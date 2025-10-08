// server/src/routes/tenants.js
const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const {protect: authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');

// @route   GET /api/tenants
// @desc    Get all tenants
// @access  Private/Agent/Admin
router.get('/', authenticateToken, authorizeRoles('agent', 'admin'), tenantController.getAllTenants);

// @route   GET /api/tenants/stats
// @desc    Get tenant statistics
// @access  Private/Agent/Admin
router.get('/stats', authenticateToken, authorizeRoles('agent', 'admin'), tenantController.getTenantStats);

// @route   GET /api/tenants/:id
// @desc    Get tenant by ID
// @access  Private/Agent/Admin
router.get('/:id', authenticateToken, authorizeRoles('agent', 'admin'), tenantController.getTenantById);

// @route   POST /api/tenants
// @desc    Create new tenant
// @access  Private/Agent/Admin
router.post('/', authenticateToken, authorizeRoles('agent', 'admin'), tenantController.createTenant);

// @route   PUT /api/tenants/:id
// @desc    Update tenant
// @access  Private/Agent/Admin
router.put('/:id', authenticateToken, authorizeRoles('agent', 'admin'), tenantController.updateTenant);

// @route   DELETE /api/tenants/:id
// @desc    Delete tenant
// @access  Private/Agent/Admin
router.delete('/:id', authenticateToken, authorizeRoles('agent', 'admin'), tenantController.deleteTenant);

module.exports = router;