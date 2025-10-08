// server/src/controllers/tenantController.js
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');
const Payment = require('../models/Payment');
const User = require('../models/User');

// Create tenant
exports.createTenant = async (req, res) => {
  try {
    const { user, property, lease, emergencyContact, occupation, employer } = req.body;

    const propertyExists = await Property.findById(property);
    if (!propertyExists) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const tenant = new Tenant({
      user,
      property,
      lease,
      emergencyContact,
      occupation,
      employer,
      addedBy: req.user.id
    });

    await tenant.save();

    propertyExists.currentOccupancy += 1;
    propertyExists.status = propertyExists.currentOccupancy >= propertyExists.maxOccupancy ? 'occupied' : 'available';
    await propertyExists.save();

    res.status(201).json({ message: 'Tenant created successfully', tenant });
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all tenants
exports.getAllTenants = async (req, res) => {
  try {
    const { status, property, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (req.user.role === 'agent') {
      const properties = await Property.find({ agent: req.user.id }).select('_id');
      query.property = { $in: properties.map(p => p._id) };
    }

    if (status) query.status = status;
    if (property) query.property = property;

    const tenants = await Tenant.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('property', 'name address rent')
      .populate('lease')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Tenant.countDocuments(query);

    res.json({
      tenants,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get tenant by ID
exports.getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .populate('user')
      .populate('property')
      .populate('lease');

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const payments = await Payment.find({ tenant: tenant._id })
      .sort({ paymentDate: -1 })
      .limit(10);

    res.json({ tenant, paymentHistory: payments });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update tenant
exports.updateTenant = async (req, res) => {
  try {
    const { emergencyContact, occupation, employer, status } = req.body;
    const tenant = await Tenant.findById(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    if (emergencyContact) tenant.emergencyContact = emergencyContact;
    if (occupation) tenant.occupation = occupation;
    if (employer) tenant.employer = employer;
    if (status) tenant.status = status;

    await tenant.save();
    res.json({ message: 'Tenant updated successfully', tenant });
  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete tenant
exports.deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const property = await Property.findById(tenant.property);
    if (property) {
      property.currentOccupancy = Math.max(0, property.currentOccupancy - 1);
      property.status = property.currentOccupancy === 0 ? 'available' : property.status;
      await property.save();
    }

    await tenant.deleteOne();
    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    console.error('Delete tenant error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get tenant statistics
exports.getTenantStats = async (req, res) => {
  try {
    const query = {};
    
    if (req.user.role === 'agent') {
      const properties = await Property.find({ agent: req.user.id }).select('_id');
      query.property = { $in: properties.map(p => p._id) };
    }

    const total = await Tenant.countDocuments(query);
    const active = await Tenant.countDocuments({ ...query, status: 'active' });
    const inactive = await Tenant.countDocuments({ ...query, status: 'inactive' });

    res.json({ total, active, inactive });
  } catch (error) {
    console.error('Get tenant stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};