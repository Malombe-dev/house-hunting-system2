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

exports.createTenant = async (req, res, next) => {
  try {
    const {
      userId, // For existing seeker conversion
      userData, // For new user creation
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

    console.log('📝 Creating tenant with data:', {
      userId,
      userData: userData ? { ...userData, password: '***' } : null,
      property,
      moveInDate,
      rentAmount,
      depositAmount
    });

    // Validate required fields
    if (!property || !moveInDate || !rentAmount || !depositAmount || !leaseStartDate || !leaseEndDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required lease information'
      });
    }

    // Check if property exists and is available
    const propertyDoc = await Property.findById(property);
    if (!propertyDoc) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if property is available
    if (propertyDoc.availability !== 'available' && propertyDoc.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Property is not available for rent'
      });
    }

    let tenantUser;

    // Handle user creation or conversion
    if (userId) {
      // Converting existing seeker to tenant
      console.log('🔄 Converting existing seeker to tenant:', userId);
      
      tenantUser = await User.findById(userId);
      if (!tenantUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update user role to tenant
      if (tenantUser.role === 'seeker') {
        tenantUser.role = 'tenant';
        await tenantUser.save();
        console.log('✅ Updated user role from seeker to tenant');
      }

    } else if (userData) {
      // Creating new tenant user
      console.log('➕ Creating new tenant user');

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email },
          { idNumber: userData.idNumber }
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.email === userData.email 
            ? 'Email already registered' 
            : 'ID number already registered'
        });
      }

      // Create new user with mustChangePassword flag
      tenantUser = await User.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        idNumber: userData.idNumber,
        password: userData.password, // Auto-generated password from frontend
        role: 'tenant',
        mustChangePassword: true, // CRITICAL: Force password change on first login
        isActive: true,
        verified: false
      });

      console.log('✅ Created new tenant user with mustChangePassword=true');
      console.log('   - Email:', tenantUser.email);
      console.log('   - Must change password:', tenantUser.mustChangePassword);

    } else {
      return res.status(400).json({
        success: false,
        message: 'Either userId or userData is required'
      });
    }

    // Create lease
    console.log('📄 Creating lease agreement');
    const lease = await Lease.create({
      property: property,
      tenant: tenantUser._id,
      agent: req.user._id, // Current logged in agent
      startDate: new Date(leaseStartDate),
      endDate: new Date(leaseEndDate),
      rentAmount: parseFloat(rentAmount),
      depositAmount: parseFloat(depositAmount),
      paymentDueDate: 1, // Default to 1st of month
      status: 'pending',
      signedByAgent: true,
      agentSignatureDate: new Date()
    });
    console.log('✅ Lease created:', lease._id);

    // Create tenant record
    console.log('👤 Creating tenant record');
    const tenant = await Tenant.create({
      user: tenantUser._id,
      property: property,
      lease: lease._id,
      moveInDate: new Date(moveInDate),
      rentAmount: parseFloat(rentAmount),
      depositAmount: parseFloat(depositAmount),
      depositStatus: 'held',
      status: 'active',
      emergencyContact,
      employmentInfo,
      references: references || [],
      createdBy: req.user._id,
      agent: req.user._id
    });
    console.log('✅ Tenant created:', tenant._id);

    // Update property availability
    propertyDoc.availability = 'occupied';
    propertyDoc.status = 'occupied';
    await propertyDoc.save();
    console.log('✅ Property marked as rented');

    // Populate tenant data for response
    const populatedTenant = await Tenant.findById(tenant._id)
      .populate('user', 'firstName lastName email phone')
      .populate('property', 'title location rent')
      .populate('lease');

    console.log('🎉 Tenant creation successful');

    res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      tenant: populatedTenant,
      // Include user info for password notification
      userCreated: !userId,
      userEmail: tenantUser.email,
      mustChangePassword: tenantUser.mustChangePassword
    });

  } catch (error) {
    console.error('❌ Create tenant error:', error);
    next(error);
  }
};

// @desc    Get all tenants
// @route   GET /api/tenants
// @access  Private (Agent/Admin only)
exports.getTenants = async (req, res, next) => {
  try {
    const { status, property, search } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by property
    if (property) {
      query.property = property;
    }

    // Search by user details
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
      .populate('user', 'firstName lastName email phone avatar')
      .populate('property', 'title location rent bedrooms bathrooms')
      .populate('lease', 'startDate endDate status')
      .populate('agent', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tenants.length,
      tenants
    });

  } catch (error) {
    console.error('Get tenants error:', error);
    next(error);
  }
};

// @desc    Get single tenant
// @route   GET /api/tenants/:id
// @access  Private
exports.getTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .populate('user')
      .populate('property')
      .populate('lease')
      .populate('paymentHistory')
      .populate('maintenanceRequests')
      .populate('agent', 'firstName lastName email phone');

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    res.status(200).json({
      success: true,
      tenant
    });

  } catch (error) {
    console.error('Get tenant error:', error);
    next(error);
  }
};

// @desc    Update tenant
// @route   PUT /api/tenants/:id
// @access  Private (Agent/Admin only)
exports.updateTenant = async (req, res, next) => {
  try {
    const {
      emergencyContact,
      employmentInfo,
      references,
      status,
      notes
    } = req.body;

    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Update fields
    if (emergencyContact) tenant.emergencyContact = emergencyContact;
    if (employmentInfo) tenant.employmentInfo = employmentInfo;
    if (references) tenant.references = references;
    if (status) tenant.status = status;

    // Add note if provided
    if (notes) {
      tenant.notes.push({
        content: notes,
        createdBy: req.user._id
      });
    }

    await tenant.save();

    const updatedTenant = await Tenant.findById(tenant._id)
      .populate('user')
      .populate('property')
      .populate('lease');

    res.status(200).json({
      success: true,
      message: 'Tenant updated successfully',
      tenant: updatedTenant
    });

  } catch (error) {
    console.error('Update tenant error:', error);
    next(error);
  }
};

// @desc    Terminate tenant lease
// @route   POST /api/tenants/:id/terminate
// @access  Private (Agent/Admin only)
exports.terminateTenant = async (req, res, next) => {
  try {
    const { reason, moveOutDate } = req.body;

    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Update tenant status
    tenant.status = 'terminated';
    tenant.moveOutDate = moveOutDate || new Date();
    await tenant.save();

    // Update lease
    const lease = await Lease.findById(tenant.lease);
    if (lease) {
      lease.status = 'terminated';
      lease.terminationReason = reason;
      lease.terminationDate = new Date();
      lease.terminatedBy = req.user._id;
      await lease.save();
    }

    // Update property availability
    const property = await Property.findById(tenant.property);
    if (property) {
      property.availability = 'available';
      property.status = 'available';
      await property.save();
    }

    res.status(200).json({
      success: true,
      message: 'Tenant lease terminated successfully',
      tenant
    });

  } catch (error) {
    console.error('Terminate tenant error:', error);
    next(error);
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

    console.log('User making request:', {
      userId: req.user._id,
      role: req.user.role
    });

    // CRITICAL: Filter based on user role - UPDATED
    if (req.user.role === 'employee') {
      // Employee sees only tenants they created
      query.createdBy = req.user._id;
      console.log('👤 Employee filter: Only tenants created by themselves');
    } else if (req.user.role === 'agent' || req.user.role === 'landlord') {
      // Agent/Landlord sees ALL tenants under their management:
      // 1. Tenants where they are the direct agent, OR
      // 2. Tenants created by employees in their agency/branch
      
      console.log('🔍 Finding employees for agent:', req.user._id);
      
      // Try different ways to find employees under this agent
      const employees = await User.find({
        role: 'employee',
        $or: [
          { agent: req.user._id }, // Direct agent assignment
          { createdBy: req.user._id }, // Employees created by this agent
          { branch: req.user.branch }, // Same branch (if you have branch system)
          { agency: req.user.agency } // Same agency (if you have agency system)
        ]
      }).select('_id firstName lastName email agent createdBy branch');
      
      console.log('👥 Employees found:', employees.map(emp => ({
        id: emp._id,
        name: `${emp.firstName} ${emp.lastName}`,
        agent: emp.agent,
        createdBy: emp.createdBy,
        branch: emp.branch
      })));
      
      const employeeIds = employees.map(emp => emp._id);
      
      // If no employees found, just show agent's own tenants
      if (employeeIds.length === 0) {
        console.log('ℹ️ No employees found, showing only agent-owned tenants');
        query.agent = req.user._id;
      } else {
        // Query: tenants where agent is current user OR created by their employees
        query.$or = [
          { agent: req.user._id }, // Direct agent assignments
          { createdBy: { $in: employeeIds } } // Created by employees
        ];
        console.log('🏢 Agent/Landlord filter: All tenants under their management');
      }
    }
    // Admin sees all tenants (no filter)

    console.log('Role-based filter:', JSON.stringify(query, null, 2));

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

    console.log('Final query:', JSON.stringify(query, null, 2));

    const tenants = await Tenant.find(query)
      .populate('user')
      .populate('property')
      .populate('lease')
      .populate('createdBy')
      .populate('agent')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Tenant.countDocuments(query);

    console.log(`Found ${tenants.length} tenants out of ${total} total`);
    
    // Debug: Show tenant ownership
    tenants.forEach(tenant => {
      const createdByName = tenant.createdBy ? 
        `${tenant.createdBy.firstName} ${tenant.createdBy.lastName}` : 'Unknown';
      const agentName = tenant.agent ? 
        `${tenant.agent.firstName} ${tenant.agent.lastName}` : 'No Agent';
      
      console.log(`   - Tenant: ${tenant.user?.firstName} ${tenant.user?.lastName}, Created By: ${createdByName} (${tenant.createdBy?._id}), Agent: ${agentName} (${tenant.agent?._id})`);
    });

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
    let filter = {};
    
    console.log('📊 Stats - User making request:', {
      userId: req.user._id,
      role: req.user.role
    });

    // Apply the same role-based filtering as getAllTenants
    if (req.user.role === 'employee') {
      filter.createdBy = req.user._id;
      console.log('👤 Stats - Employee filter: Only tenants created by themselves');
    } else if (req.user.role === 'agent' || req.user.role === 'landlord') {
      // Agent/Landlord sees ALL tenants under their management:
      // 1. Tenants where they are the direct agent, OR
      // 2. Tenants created by employees in their agency/branch
      
      console.log('🔍 Stats - Finding employees for agent:', req.user._id);
      
      // Try different ways to find employees under this agent
      const employees = await User.find({
        role: 'employee',
        $or: [
          { agent: req.user._id }, // Direct agent assignment
          { createdBy: req.user._id }, // Employees created by this agent
          { branch: req.user.branch }, // Same branch (if you have branch system)
          { agency: req.user.agency } // Same agency (if you have agency system)
        ]
      }).select('_id firstName lastName email agent createdBy branch');
      
      console.log('👥 Stats - Employees found:', employees.map(emp => ({
        id: emp._id,
        name: `${emp.firstName} ${emp.lastName}`,
        agent: emp.agent,
        createdBy: emp.createdBy,
        branch: emp.branch
      })));
      
      const employeeIds = employees.map(emp => emp._id);
      
      // If no employees found, just show agent's own tenants
      if (employeeIds.length === 0) {
        console.log('ℹ️ Stats - No employees found, showing only agent-owned tenants');
        filter.agent = req.user._id;
      } else {
        // Query: tenants where agent is current user OR created by their employees
        filter.$or = [
          { agent: req.user._id }, // Direct agent assignments
          { createdBy: { $in: employeeIds } } // Created by employees
        ];
        console.log('🏢 Stats - Agent/Landlord filter: All tenants under their management');
      }
    }
    // Admin sees all tenants (no filter)

    console.log('📊 Stats filter:', JSON.stringify(filter, null, 2));
    
    const stats = {
      total: await Tenant.countDocuments(filter),
      active: await Tenant.countDocuments({ ...filter, status: 'active' }),
      inactive: await Tenant.countDocuments({ ...filter, status: 'inactive' }),
      terminated: await Tenant.countDocuments({ ...filter, status: 'terminated' })
    };
    
    console.log('📈 Calculated stats:', stats);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get tenant stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tenant statistics'
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