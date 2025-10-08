// server/src/controllers/maintenanceController.js
const Maintenance = require('../models/Maintenance');
const Property = require('../models/Property');
const Tenant = require('../models/Tenant');

// Create maintenance request
exports.createRequest = async (req, res) => {
  try {
    const {
      property,
      tenant,
      title,
      description,
      category,
      priority,
      images
    } = req.body;

    // Verify property exists
    const propertyExists = await Property.findById(property);
    if (!propertyExists) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const maintenance = new Maintenance({
      property,
      tenant: tenant || req.user.role === 'tenant' ? req.user.id : null,
      title,
      description,
      category,
      priority: priority || 'medium',
      images: images || [],
      status: 'pending',
      createdBy: req.user.id
    });

    await maintenance.save();

    res.status(201).json({
      message: 'Maintenance request created successfully',
      maintenance
    });
  } catch (error) {
    console.error('Create maintenance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all maintenance requests
exports.getAllRequests = async (req, res) => {
  try {
    const {
      property,
      status,
      priority,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};
    
    // Role-based filtering
    if (req.user.role === 'agent') {
      const properties = await Property.find({ agent: req.user.id }).select('_id');
      query.property = { $in: properties.map(p => p._id) };
    } else if (req.user.role === 'tenant') {
      const tenantRecord = await Tenant.findOne({ user: req.user.id });
      if (tenantRecord) {
        query.tenant = tenantRecord._id;
      }
    }

    if (property) query.property = property;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const requests = await Maintenance.find(query)
      .populate('property', 'name address')
      .populate({
        path: 'tenant',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone'
        }
      })
      .populate('assignedTo', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Maintenance.countDocuments(query);

    res.json({
      requests,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get maintenance requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get maintenance request by ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await Maintenance.findById(req.params.id)
      .populate('property', 'name address images')
      .populate({
        path: 'tenant',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone avatar'
        }
      })
      .populate('assignedTo', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName email')
      .populate('completedBy', 'firstName lastName email');

    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Get maintenance request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update maintenance request
exports.updateRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      status,
      assignedTo,
      scheduledDate,
      images,
      cost,
      notes
    } = req.body;

    const request = await Maintenance.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    // Update fields
    if (title) request.title = title;
    if (description) request.description = description;
    if (category) request.category = category;
    if (priority) request.priority = priority;
    if (assignedTo) request.assignedTo = assignedTo;
    if (scheduledDate) request.scheduledDate = scheduledDate;
    if (images) request.images = images;
    if (cost) request.cost = cost;
    if (notes) request.notes = notes;

    // Update status and related fields
    if (status) {
      request.status = status;
      
      if (status === 'in-progress' && !request.startedAt) {
        request.startedAt = new Date();
      }
      
      if (status === 'completed') {
        request.completedAt = new Date();
        request.completedBy = req.user.id;
      }
    }

    await request.save();

    res.json({
      message: 'Maintenance request updated successfully',
      request
    });
  } catch (error) {
    console.error('Update maintenance request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete maintenance request
exports.deleteRequest = async (req, res) => {
  try {
    const request = await Maintenance.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    await request.deleteOne();

    res.json({ message: 'Maintenance request deleted successfully' });
  } catch (error) {
    console.error('Delete maintenance request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign maintenance request
exports.assignRequest = async (req, res) => {
  try {
    const { assignedTo, scheduledDate } = req.body;

    const request = await Maintenance.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    request.assignedTo = assignedTo;
    request.status = 'assigned';
    if (scheduledDate) request.scheduledDate = scheduledDate;

    await request.save();

    res.json({
      message: 'Maintenance request assigned successfully',
      request
    });
  } catch (error) {
    console.error('Assign maintenance request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Complete maintenance request
exports.completeRequest = async (req, res) => {
  try {
    const { cost, notes, completionImages } = req.body;

    const request = await Maintenance.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    request.status = 'completed';
    request.completedAt = new Date();
    request.completedBy = req.user.id;
    if (cost) request.cost = cost;
    if (notes) request.notes = notes;
    if (completionImages) request.completionImages = completionImages;

    await request.save();

    res.json({
      message: 'Maintenance request completed successfully',
      request
    });
  } catch (error) {
    console.error('Complete maintenance request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get maintenance statistics
exports.getMaintenanceStats = async (req, res) => {
  try {
    const query = {};
    
    // Role-based filtering
    if (req.user.role === 'agent') {
      const properties = await Property.find({ agent: req.user.id }).select('_id');
      query.property = { $in: properties.map(p => p._id) };
    }

    const total = await Maintenance.countDocuments(query);
    const pending = await Maintenance.countDocuments({ ...query, status: 'pending' });
    const inProgress = await Maintenance.countDocuments({ ...query, status: 'in-progress' });
    const completed = await Maintenance.countDocuments({ ...query, status: 'completed' });

    const byPriority = await Maintenance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const byCategory = await Maintenance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalCost = await Maintenance.aggregate([
      { $match: { ...query, cost: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: null,
          total: { $sum: '$cost' }
        }
      }
    ]);

    res.json({
      overview: {
        total,
        pending,
        inProgress,
        completed
      },
      byPriority,
      byCategory,
      totalCost: totalCost[0]?.total || 0
    });
  } catch (error) {
    console.error('Get maintenance stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};