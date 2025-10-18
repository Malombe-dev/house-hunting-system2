const Property = require('../models/Property');
const User = require('../models/User');

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      city,
      area,
      features,
      availability = 'available',
      search,
      approvalStatus
    } = req.query;

    // Build filter
    const filter = {};
    
    // Only show approved properties for non-admin/agent users
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'agent')) {
      filter.approved = true;
      filter.approvalStatus = 'approved';
    }

    // If agent, show their own properties regardless of approval
    if (req.user && req.user.role === 'agent') {
      filter.$or = [
        { approved: true, approvalStatus: 'approved' },
        { agent: req.user._id }
      ];
    }

    // Admin can filter by approval status
    if (req.user && req.user.role === 'admin' && approvalStatus) {
      filter.approvalStatus = approvalStatus;
      delete filter.approved; // Remove approved filter for admin
    }

    if (propertyType) filter.propertyType = propertyType;
    if (availability) filter.availability = availability;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (area) filter['location.area'] = new RegExp(area, 'i');
    if (bedrooms) filter.bedrooms = parseInt(bedrooms);
    if (bathrooms) filter.bathrooms = { $gte: parseInt(bathrooms) };
    
    // Price range (handles both rent and price for land)
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseInt(minPrice);
      if (maxPrice) priceFilter.$lte = parseInt(maxPrice);
      
      // Search in both rent and price fields
      filter.$or = [
        { rent: priceFilter },
        { price: priceFilter }
      ];
    }

    // Features
    if (features) {
      const featureArray = features.split(',');
      filter.features = { $all: featureArray };
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Execute query
    const properties = await Property.find(filter)
      .populate('agent', 'firstName lastName email phone avatar businessName')
      .populate('createdBy', 'firstName lastName email role')
      .populate('approvedBy', 'firstName lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count
    const count = await Property.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        properties,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalProperties: count,
          hasMore: page * limit < count
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('agent', 'firstName lastName email phone avatar businessName')
      .populate('tenant', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName email role')
      .populate('approvedBy', 'firstName lastName');

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    // Check if user can view this property
    if (!property.approved && property.approvalStatus !== 'approved') {
      // Only allow viewing if user is admin, agent who owns it, or employee who created it
      if (!req.user || 
          (req.user.role !== 'admin' && 
           property.agent.toString() !== req.user._id.toString() &&
           property.createdBy._id.toString() !== req.user._id.toString())) {
        return res.status(403).json({
          status: 'error',
          message: 'This property is pending approval'
        });
      }
    }

    // Increment views (not for owner/creator)
    if (!req.user || 
        (req.user._id.toString() !== property.agent._id.toString() &&
         req.user._id.toString() !== property.createdBy._id.toString())) {
      await property.incrementViews();
    }

    res.status(200).json({
      status: 'success',
      data: { property }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create property
// @route   POST /api/properties
// @access  Private (Agent/Employee)
exports.createProperty = async (req, res, next) => {
  try {
    // Set agent (for employees, this would be assigned by admin/agent)
    req.body.agent = req.body.agent || req.user._id;
    
    // Set creator info
    req.body.createdBy = req.user._id;
    req.body.createdByRole = req.user.role;

    // ✅ FIXED: Handle Cloudinary image uploads from memory buffers
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        console.log(`📤 Starting Cloudinary upload for ${req.files.length} files...`);
        
        const { uploadMultipleImages, uploadImageBase64 } = require('../config/cloudinary');
        
        // Try the main upload method first
        let cloudinaryResults;
        try {
          cloudinaryResults = await uploadMultipleImages(req.files, 'properties');
          console.log('✅ Main upload method successful');
        } catch (mainError) {
          console.log('❌ Main upload failed, trying base64 method:', mainError.message);
          // Fallback to base64 method
          cloudinaryResults = await Promise.all(
            req.files.map(file => uploadImageBase64(file.buffer, 'properties'))
          );
          console.log('✅ Base64 upload method successful');
        }
        
        imageUrls = cloudinaryResults.map(result => result.url);
        console.log('✅ Cloudinary URLs:', imageUrls);
        
      } catch (uploadError) {
        console.error('❌ All Cloudinary upload methods failed:', uploadError);
        return res.status(400).json({
          status: 'error',
          message: 'Failed to upload images to Cloudinary: ' + uploadError.message
        });
      }
    } else {
      console.log('ℹ️ No files to upload');
    }

    // ✅ FIXED: Use Cloudinary URLs
    req.body.images = imageUrls;

    // Parse JSON fields if they come as strings
    if (typeof req.body.location === 'string') {
      try {
        req.body.location = JSON.parse(req.body.location);
      } catch (parseError) {
        console.error('❌ Error parsing location:', parseError);
        return res.status(400).json({
          status: 'error',
          message: 'Invalid location format'
        });
      }
    }

    if (typeof req.body.features === 'string') {
      try {
        req.body.features = JSON.parse(req.body.features);
      } catch (parseError) {
        console.error('❌ Error parsing features:', parseError);
        return res.status(400).json({
          status: 'error',
          message: 'Invalid features format'
        });
      }
    }

    // Validate required fields based on property type
    const propertyType = req.body.propertyType;
    const isLandType = ['land', 'plot', 'farm'].includes(propertyType);

    // For land types, price is required
    if (isLandType && !req.body.price) {
      return res.status(400).json({
        status: 'error',
        message: 'Price is required for land properties'
      });
    }

    // For non-land types, rent is required
    if (!isLandType && !req.body.rent) {
      return res.status(400).json({
        status: 'error',
        message: 'Monthly rent is required'
      });
    }

    // Log the data being saved (for debugging)
    console.log('📝 Creating property with data:', {
      title: req.body.title,
      propertyType: req.body.propertyType,
      imagesCount: req.body.images ? req.body.images.length : 0,
      hasLocation: !!req.body.location,
      hasFeatures: !!req.body.features
    });

    const property = await Property.create(req.body);

    // Populate the created property
    await property.populate('agent createdBy approvedBy');

    // Determine if property needs approval
    const needsApproval = req.user.role === 'employee';

    res.status(201).json({
      status: 'success',
      message: needsApproval 
        ? 'Property created successfully and pending approval' 
        : 'Property created successfully',
      data: { 
        property,
        needsApproval
      }
    });
  } catch (error) {
    console.error('❌ Error in createProperty:', error);
    next(error);
  }
};

// @desc    Update property
// @route   PATCH /api/properties/:id
// @access  Private (Agent/Employee/Admin)
exports.updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    // Check ownership
    const isOwner = property.agent.toString() === req.user._id.toString();
    const isCreator = property.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isCreator && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this property'
      });
    }

    // ✅ UPDATED: Handle new Cloudinary image uploads
    if (req.files && req.files.cloudinaryResults) {
      const newImages = req.files.cloudinaryResults.map(result => result.url);
      req.body.images = [...(property.images || []), ...newImages];
    } else if (req.files && req.files.length > 0) {
      // Handle direct file uploads
      const { uploadMultipleImages } = require('../config/cloudinary');
      const cloudinaryResults = await uploadMultipleImages(
        req.files.map(file => ({ path: file.path })),
        'properties'
      );
      const newImages = cloudinaryResults.map(result => result.url);
      req.body.images = [...(property.images || []), ...newImages];
      
      // ✅ Optional: Delete local files after Cloudinary upload
      req.files.forEach(file => {
        const fs = require('fs');
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    // Don't allow updating certain fields
    delete req.body.agent;
    delete req.body.createdBy;
    delete req.body.createdByRole;
    delete req.body.views;
    delete req.body.inquiries;
    delete req.body.applications;
    
    // Only admin can update approval fields
    if (req.user.role !== 'admin') {
      delete req.body.approved;
      delete req.body.approvalStatus;
      delete req.body.approvedBy;
      delete req.body.approvedAt;
    }

    // If employee updates, reset approval status
    if (req.user.role === 'employee' && property.approvalStatus === 'approved') {
      req.body.approvalStatus = 'pending';
      req.body.approved = false;
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('agent createdBy approvedBy');

    res.status(200).json({
      status: 'success',
      message: 'Property updated successfully',
      data: { property: updatedProperty }
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Agent/Admin)
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    // Check ownership
    const isOwner = property.agent.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this property'
      });
    }

    // Check if property has active tenants
    if (property.availability === 'occupied') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete property with active tenants'
      });
    }

    await property.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Property deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve property
// @route   PATCH /api/properties/:id/approve
// @access  Private (Agent/Admin)
exports.approveProperty = async (req, res, next) => {
  try {
    // Only agents and admins can approve
    if (req.user.role !== 'agent' && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to approve properties'
      });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    // Check if already approved
    if (property.approvalStatus === 'approved') {
      return res.status(400).json({
        status: 'error',
        message: 'Property is already approved'
      });
    }

    await property.approve(req.user);
    await property.populate('agent createdBy approvedBy');

    res.status(200).json({
      status: 'success',
      message: 'Property approved successfully',
      data: { property }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject property
// @route   PATCH /api/properties/:id/reject
// @access  Private (Agent/Admin)
exports.rejectProperty = async (req, res, next) => {
  try {
    // Only agents and admins can reject
    if (req.user.role !== 'agent' && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to reject properties'
      });
    }

    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        status: 'error',
        message: 'Rejection reason is required'
      });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    await property.reject(req.user, reason);
    await property.populate('agent createdBy approvedBy');

    res.status(200).json({
      status: 'success',
      message: 'Property rejected',
      data: { property }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending properties for approval
// @route   GET /api/properties/pending
// @access  Private (Agent/Admin)
exports.getPendingProperties = async (req, res, next) => {
  try {
    // Only agents and admins can view pending properties
    if (req.user.role !== 'agent' && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view pending properties'
      });
    }

    const properties = await Property.findPendingApprovals()
      .populate('agent', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName email role');

    res.status(200).json({
      status: 'success',
      data: {
        count: properties.length,
        properties
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get agent properties
// @route   GET /api/properties/agent/:agentId
// @access  Public
exports.getPropertiesByAgent = async (req, res, next) => {
  try {
    const filter = { agent: req.params.agentId };
    
    // Non-authenticated users only see approved properties
    if (!req.user || req.user._id.toString() !== req.params.agentId) {
      filter.approved = true;
      filter.approvalStatus = 'approved';
    }

    const properties = await Property.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      data: {
        count: properties.length,
        properties
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add these methods to your propertyController.js

// @desc    Get my properties (for logged in user)
// @route   GET /api/properties/my-properties
// @access  Private
exports.getMyProperties = async (req, res, next) => {
  try {
    const filter = {};
    
    // If agent, show properties they own AND properties created by their employees
    if (req.user.role === 'agent' || req.user.role === 'landlord') {
      // Get all employees under this agent
      const employees = await User.find({ 
        parentAgent: req.user._id,
        role: 'employee'
      }).select('_id');
      
      const employeeIds = employees.map(emp => emp._id);
      
      // Show properties where:
      // 1. Agent is the owner (agent field)
      // 2. OR created by any of their employees
      filter.$or = [
        { agent: req.user._id },
        { createdBy: { $in: employeeIds } }
      ];
    } 
    // If employee, show properties they created
    else if (req.user.role === 'employee') {
      filter.createdBy = req.user._id;
    }
    // If admin, show all properties
    else if (req.user.role === 'admin') {
      // No filter - show all
    }

    const properties = await Property.find(filter)
      .populate('agent', 'firstName lastName email businessName')
      .populate('createdBy', 'firstName lastName role')
      .populate('approvedBy', 'firstName lastName')
      .sort('-createdAt');

    // Calculate statistics for agents
    let stats = null;
    if (req.user.role === 'agent' || req.user.role === 'landlord') {
      const totalProperties = properties.length;
      const myDirectProperties = properties.filter(p => 
        p.agent._id.toString() === req.user._id.toString()
      ).length;
      const employeeProperties = totalProperties - myDirectProperties;
      
      const approvedCount = properties.filter(p => p.approvalStatus === 'approved').length;
      const pendingCount = properties.filter(p => p.approvalStatus === 'pending').length;
      const rejectedCount = properties.filter(p => p.approvalStatus === 'rejected').length;
      
      const availableCount = properties.filter(p => p.availability === 'available').length;
      const occupiedCount = properties.filter(p => p.availability === 'occupied').length;

      stats = {
        totalProperties,
        myDirectProperties,
        employeeProperties,
        approvedCount,
        pendingCount,
        rejectedCount,
        availableCount,
        occupiedCount
      };
    }

    res.status(200).json({
      status: 'success',
      data: {
        count: properties.length,
        properties,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};


// @route   GET /api/properties/company-properties
// @access  Private (Agent/Landlord)
exports.getCompanyProperties = async (req, res, next) => {
  try {
    console.log('🔍 === COMPANY PROPERTIES DEBUG START ===');
    console.log('👤 Request User ID:', req.user._id.toString());
    console.log('👤 Request User Role:', req.user.role);

    // Allow agents, landlords, AND employees to access all properties
    if (!['agent', 'landlord', 'employee', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    let filter = {};
    let employees = [];

    if (req.user.role === 'employee') {
      // 🆕 EMPLOYEE: Can view ALL properties (for customer inquiries)
      console.log('👤 Employee - viewing ALL properties for customer inquiries');
      // No filter - employees see everything
      filter = {};
    } else if (req.user.role === 'agent' || req.user.role === 'landlord') {
      // Agent/Landlord sees company properties (their own + employees)
      console.log('🔎 Searching for employees with createdBy:', req.user._id.toString());
      
      employees = await User.find({ 
        createdBy: req.user._id,
        role: 'employee'
      }).select('_id firstName lastName createdBy role');
      
      console.log('👥 Employees found:', employees.length);

      const employeeIds = employees.map(emp => emp._id);
      
      filter = {
        $or: [
          { agent: req.user._id },
          { createdBy: { $in: employeeIds } }
        ]
      };
      console.log('👔 Agent/Landlord - viewing company properties');
    }
    // Admin sees all properties (no filter)

    console.log('🔎 Property filter:', JSON.stringify(filter));

    const properties = await Property.find(filter)
      .populate('agent', 'firstName lastName email businessName')
      .populate('createdBy', 'firstName lastName role')
      .populate('approvedBy', 'firstName lastName')
      .sort('-createdAt');

    console.log('🏠 Properties found:', properties.length);
    
    // Debug each property
    properties.forEach((prop, index) => {
      console.log(`   Property ${index + 1}:`, {
        title: prop.title,
        agent: prop.agent?._id?.toString(),
        createdBy: prop.createdBy?._id?.toString(),
        approvalStatus: prop.approvalStatus,
        availability: prop.availability
      });
    });

    // Group properties by creator (for agents/landlords)
    const propertiesByCreator = {};
    
    if (req.user.role === 'agent' || req.user.role === 'landlord') {
      // Add agent's direct properties
      const agentProperties = properties.filter(p => 
        p.agent && p.agent._id.toString() === req.user._id.toString()
      );
      
      propertiesByCreator[req.user._id.toString()] = {
        creator: {
          _id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          role: req.user.role
        },
        properties: agentProperties
      };

      // Add properties by each employee
      employees.forEach(employee => {
        const empProperties = properties.filter(p => 
          p.createdBy && p.createdBy._id.toString() === employee._id.toString()
        );
        
        if (empProperties.length > 0) {
          propertiesByCreator[employee._id.toString()] = {
            creator: {
              _id: employee._id,
              firstName: employee.firstName,
              lastName: employee.lastName,
              role: 'employee'
            },
            properties: empProperties
          };
        }
      });
    }

    // Calculate stats
    const stats = {
      totalProperties: properties.length,
      approved: properties.filter(p => p.approvalStatus === 'approved').length,
      pending: properties.filter(p => p.approvalStatus === 'pending').length,
      rejected: properties.filter(p => p.approvalStatus === 'rejected').length,
      available: properties.filter(p => p.availability === 'available').length,
      occupied: properties.filter(p => p.availability === 'occupied').length,
      underMaintenance: properties.filter(p => p.availability === 'under maintenance').length,
      totalExpectedRent: properties
        .filter(p => p.rent && p.availability === 'occupied')
        .reduce((sum, p) => sum + (p.rent || 0), 0),
      totalPotentialRent: properties
        .filter(p => p.rent)
        .reduce((sum, p) => sum + (p.rent || 0), 0)
    };

    // Add employee-specific stats
    if (req.user.role === 'employee') {
      stats.myProperties = properties.filter(p => 
        p.createdBy && p.createdBy._id.toString() === req.user._id.toString()
      ).length;
    } else if (req.user.role === 'agent' || req.user.role === 'landlord') {
      stats.myDirectProperties = properties.filter(p => 
        p.agent && p.agent._id.toString() === req.user._id.toString()
      ).length;
      stats.employeeProperties = properties.length - stats.myDirectProperties;
      stats.totalEmployees = employees.length;
    }

    console.log('✅ Sending response with:', {
      properties: properties.length,
      employees: employees.length,
      userRole: req.user.role
    });

    res.status(200).json({
      status: 'success',
      data: {
        properties,
        propertiesByCreator: req.user.role === 'employee' ? [] : Object.values(propertiesByCreator),
        stats,
        employees: req.user.role === 'employee' ? [] : employees,
        userRole: req.user.role // Include role in response for frontend
      }
    });

  } catch (error) {
    console.error('❌ Error in getCompanyProperties:', error);
    next(error);
  }
};
// @desc    Search properties
// @route   GET /api/properties/search
// @access  Public
exports.searchProperties = async (req, res, next) => {
  try {
    const { q, propertyType, city, minPrice, maxPrice, bedrooms } = req.query;
    
    const filter = {
      approved: true,
      approvalStatus: 'approved',
      availability: 'available'
    };

    if (q) {
      filter.$text = { $search: q };
    }

    if (propertyType) filter.propertyType = propertyType;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (bedrooms) filter.bedrooms = parseInt(bedrooms);

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseInt(minPrice);
      if (maxPrice) priceFilter.$lte = parseInt(maxPrice);
      filter.$or = [
        { rent: priceFilter },
        { price: priceFilter }
      ];
    }

    const properties = await Property.find(filter)
      .populate('agent', 'firstName lastName businessName')
      .limit(20)
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      data: {
        count: properties.length,
        properties
      }
    });
  } catch (error) {
    next(error);
  }
};