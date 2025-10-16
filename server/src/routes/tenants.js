// server/src/routes/tenants.js (UPDATED)
const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { protect: authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');

// Middleware to check employee permissions
const checkTenantPermission = (req, res, next) => {
  if (req.user.role === 'employee') {
    // Check if employee has canCreateTenants permission
    if (!req.user.permissions || !req.user.permissions.canCreateTenants) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to manage tenants'
      });
    }
  }
  next();
};

// @route   GET /api/tenants/stats
// @desc    Get tenant statistics
// @access  Private (Agent/Admin/Employee with permission)
router.get(
  '/stats',
  authenticateToken,
  authorizeRoles('agent', 'landlord', 'admin', 'employee'),
  checkTenantPermission,
  tenantController.getTenantStats
);

// @route   POST /api/tenants/convert-seeker
// @desc    Convert seeker to tenant
// @access  Private (Agent/Admin/Employee with permission)
router.post(
  '/convert-seeker',
  authenticateToken,
  authorizeRoles('agent', 'landlord', 'admin', 'employee'),
  checkTenantPermission,
  tenantController.convertSeekerToTenant
);

// @route   GET /api/tenants
// @desc    Get all tenants (filtered by role)
// @access  Private (Agent/Admin/Employee with permission)
router.get(
  '/',
  authenticateToken,
  authorizeRoles('agent', 'landlord', 'admin', 'employee'),
  checkTenantPermission,
  tenantController.getAllTenants
);

// @route   GET /api/tenants/:id
// @desc    Get tenant by ID
// @access  Private (Agent/Admin/Employee with permission)
router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('agent', 'landlord', 'admin', 'employee'),
  checkTenantPermission,
  tenantController.getTenantById
);

// @route   POST /api/tenants
// @desc    Create new tenant
// @access  Private (Agent/Admin/Employee with permission)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('agent', 'landlord', 'admin', 'employee'),
  checkTenantPermission,
  tenantController.createTenant
);

// @route   PUT /api/tenants/:id
// @desc    Update tenant
// @access  Private (Agent/Admin/Employee with permission)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('agent', 'landlord', 'admin', 'employee'),
  checkTenantPermission,
  tenantController.updateTenant
);

// @route   DELETE /api/tenants/:id
// @desc    Delete tenant (Agent/Admin only)
// @access  Private
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('agent', 'landlord', 'admin'),
  tenantController.deleteTenant
);

module.exports = router;