// server/src/controllers/tenantController.js (UPGRADED)
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Lease = require('../models/Lease');

/**
 * @desc    Create new tenant
 * @route   POST /api/tenants
 * @access  Private (Agent/Employee with permission)
 */
exports.createTenant = async (req, res) => {
  try {
    const {
      userId, // Existing user ID or null for new user
      userData, // New user data if creating account
      property,
      moveInDate,
      rentAmount,
      depositAmount,
      leaseStartDate,
      leaseEndDate,
      leaseDuration,
      emergencyContact,
      employmentInfo,
      references
    } = req.body;

    // Validate property exists
    const propertyExists = await Property.findById(property);
    if (!propertyExists) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check property availability
    if (propertyExists.status === 'occupied' || propertyExists.currentOccupancy >= propertyExists.maxOccupancy) {
      return res.status(400).json({
        success: false,
        message: 'Property is not available'
      });
    }

    let tenantUser;

    // Case 1: User ID provided (existing user - could be seeker)
    if (userId) {
      tenantUser = await User.findById(userId);
      if (!tenantUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Convert seeker to tenant
      if (tenantUser.role === 'seeker') {
        tenantUser.role = 'tenant';
        await tenantUser.save();
      }
    }
    // Case 2: Create new user account as tenant
    else if (userData) {
      const { firstName, lastName, email, phone, idNumber } = userData;

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);

      // Create new user as tenant
      tenantUser = await User.create({
        firstName,
        lastName,
        email,
        phone,
        idNumber,
        password: tempPassword,
        role: 'tenant',
        createdBy: req.user._id,
        mustChangePassword: true,
        isActive: true
      });

      console.log('New tenant user created with temp password:', tempPassword);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either userId or userData must be provided'
      });
    }

    // Create lease
    const lease = await Lease.create({
      property,
      tenant: tenantUser._id,
      startDate: leaseStartDate,
      endDate: leaseEndDate,
      duration: leaseDuration,
      rentAmount,
      depositAmount,
      status: 'active',
      createdBy: req.user._id
    });

    // Create tenant record
    const tenant = await Tenant.create({
      user: tenantUser._id,
      property,
      lease: lease._id,
      moveInDate,
      rentAmount,
      depositAmount,
      depositStatus: 'held',
      status: 'active',
      emergencyContact,
      employmentInfo,
      references,
      createdBy: req.user._id, // Track who created this tenant
      agent: propertyExists.agent // Link to property's agent
    });

    // Update property occupancy
    propertyExists.currentOccupancy += 1;
    propertyExists.status = propertyExists.currentOccupancy >= propertyExists.maxOccupancy ? 'occupied' : 'available';
    await propertyExists.save();

    // Populate response
    const populatedTenant = await Tenant.findById(tenant._id)
      .populate('user', 'firstName lastName email phone')
      .populate('property', 'name address rentAmount')
      .populate('lease');

    res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      tenant: populatedTenant,
      tempPassword: userData ? tenantUser.password : null // Return temp password if new user
    });
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get all tenants (filtered by role)
 * @route   GET /api/tenants
 * @access  Private
 */
exports.getAllTenants = async (req, res) => {
  try {
    const { status, property, search, page = 1, limit = 10 } = req.query;
    const query = {};

    // CRITICAL: Filter based on user role
    if (req.user.role === 'employee') {
      // Employee sees only tenants they created
      query.createdBy = req.user._id;
    } else if (req.user.role === 'agent' || req.user.role === 'landlord') {
      // Agent/Landlord sees tenants from their properties
      const properties = await Property.find({ agent: req.user._id }).select('_id');
      query.property = { $in: properties.map(p => p._id) };
    }
    // Admin sees all tenants (no filter)

    // Additional filters
    if (status) query.status = status;
    if (property) query.property = property;

    // Search filter
    if (search) {
      const users = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      query.user = { $in: users.map(u => u._id) };
    }

    const tenants = await Tenant.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('property', 'name address rentAmount')
      .populate('lease', 'startDate endDate status')
      .populate('createdBy', 'firstName lastName')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Tenant.countDocuments(query);

    res.json({
      success: true,
      tenants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get tenant by ID
 * @route   GET /api/tenants/:id
 * @access  Private
 */
exports.getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .populate('user')
      .populate('property')
      .populate('lease')
      .populate('createdBy', 'firstName lastName email');

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Authorization check
    if (req.user.role === 'employee' && tenant.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this tenant'
      });
    }

    // Get payment history
    const payments = await Payment.find({ tenant: tenant._id })
      .sort({ paymentDate: -1 })
      .limit(10);

    res.json({
      success: true,
      tenant,
      paymentHistory: payments
    });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Update tenant
 * @route   PUT /api/tenants/:id
 * @access  Private
 */
exports.updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Authorization check for employees
    if (req.user.role === 'employee' && tenant.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this tenant'
      });
    }

    const {
      emergencyContact,
      employmentInfo,
      references,
      status,
      depositStatus,
      moveOutDate
    } = req.body;

    if (emergencyContact) tenant.emergencyContact = emergencyContact;
    if (employmentInfo) tenant.employmentInfo = employmentInfo;
    if (references) tenant.references = references;
    if (status) tenant.status = status;
    if (depositStatus) tenant.depositStatus = depositStatus;
    if (moveOutDate) tenant.moveOutDate = moveOutDate;

    await tenant.save();

    const updatedTenant = await Tenant.findById(tenant._id)
      .populate('user', 'firstName lastName email phone')
      .populate('property', 'name address')
      .populate('lease');

    res.json({
      success: true,
      message: 'Tenant updated successfully',
      tenant: updatedTenant
    });
  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Delete tenant
 * @route   DELETE /api/tenants/:id
 * @access  Private (Agent/Admin only - employees cannot delete)
 */
exports.deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Employees cannot delete tenants
    if (req.user.role === 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Employees are not authorized to delete tenants'
      });
    }

    // Update property occupancy
    const property = await Property.findById(tenant.property);
    if (property) {
      property.currentOccupancy = Math.max(0, property.currentOccupancy - 1);
      property.status = property.currentOccupancy === 0 ? 'available' : property.status;
      await property.save();
    }

    // Update lease status
    await Lease.findByIdAndUpdate(tenant.lease, { status: 'terminated' });

    await tenant.deleteOne();

    res.json({
      success: true,
      message: 'Tenant deleted successfully'
    });
  } catch (error) {
    console.error('Delete tenant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get tenant statistics
 * @route   GET /api/tenants/stats
 * @access  Private
 */
exports.getTenantStats = async (req, res) => {
  try {
    const query = {};

    // Filter by role
    if (req.user.role === 'employee') {
      query.createdBy = req.user._id;
    } else if (req.user.role === 'agent' || req.user.role === 'landlord') {
      const properties = await Property.find({ agent: req.user._id }).select('_id');
      query.property = { $in: properties.map(p => p._id) };
    }

    const total = await Tenant.countDocuments(query);
    const active = await Tenant.countDocuments({ ...query, status: 'active' });
    const inactive = await Tenant.countDocuments({ ...query, status: 'inactive' });
    const terminated = await Tenant.countDocuments({ ...query, status: 'terminated' });

    res.json({
      success: true,
      stats: {
        total,
        active,
        inactive,
        terminated
      }
    });
  } catch (error) {
    console.error('Get tenant stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Convert seeker to tenant
 * @route   POST /api/tenants/convert-seeker
 * @access  Private
 */
exports.convertSeekerToTenant = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'seeker') {
      return res.status(400).json({
        success: false,
        message: 'User is not a seeker'
      });
    }

    user.role = 'tenant';
    await user.save();

    res.json({
      success: true,
      message: 'Seeker converted to tenant successfully',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Convert seeker error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = exports;