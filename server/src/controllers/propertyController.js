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
      search
    } = req.query;

    // Build filter
    const filter = {};
    
    // Only show approved properties for non-admin users
    if (!req.user || req.user.role !== 'admin') {
      filter.approved = true;
    }

    if (propertyType) filter.propertyType = propertyType;
    if (availability) filter.availability = availability;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (area) filter['location.area'] = new RegExp(area, 'i');
    if (bedrooms) filter.bedrooms = parseInt(bedrooms);
    if (bathrooms) filter.bathrooms = { $gte: parseInt(bathrooms) };
    
    // Price range
    if (minPrice || maxPrice) {
      filter.rent = {};
      if (minPrice) filter.rent.$gte = parseInt(minPrice);
      if (maxPrice) filter.rent.$lte = parseInt(maxPrice);
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
      .populate('agent', 'firstName lastName email phone avatar')
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
      .populate('tenant', 'firstName lastName email phone');

    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }

    // Increment views
    if (!req.user || req.user._id.toString() !== property.agent._id.toString()) {
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
// @access  Private (Agent/Landlord)
exports.createProperty = async (req, res, next) => {
  try {
    // Add agent to request body
    req.body.agent = req.user._id;

    // Handle image uploads if any
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => `/uploads/images/${file.filename}`);
    }

    const property = await Property.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Property created successfully',
      data: { property }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property
// @route   PATCH /api/properties/:id
// @access  Private (Agent/Landlord/Admin)
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
    if (req.user.role !== 'admin' && property.agent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this property'
      });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/images/${file.filename}`);
      req.body.images = [...(property.images || []), ...newImages];
    }

    // Don't allow updating certain fields
    delete req.body.agent;
    delete req.body.views;
    delete req.body.inquiries;
    delete req.body.applications;

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

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
// @access  Private (Agent/Landlord/Admin)
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
    if (req.user.role !== 'admin' && property.agent.toString() !== req.user._id.toString()) {
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

// @desc    Get agent properties
// @route   GET /api/properties/agent/:agentId
// @access  Public
exports.getPropertiesByAgent = async (req, res, next) => {
  try {
    const properties = await Property.find({ agent: req.params.agentId })
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

// @desc    Search properties
// @route   GET /api/properties/search
// @access  Public
exports.searchProperties = async (req, res, next) => {
  try {
    // Placeholder for now
    res.status(200).json({
      status: 'success',
      message: 'Search endpoint working (to be implemented soon)'
    });
  } catch (error) {
    next(error);
  }
};
