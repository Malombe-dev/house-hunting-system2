// server/src/controllers/analyticsController.js
const Property = require('../models/Property');
const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');
const Maintenance = require('../models/Maintenance');
const User = require('../models/User');

// Get dashboard analytics based on user role
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const { role } = req.user;
    let analytics = {};

    if (role === 'admin') {
      analytics = await getAdminAnalytics();
    } else if (role === 'agent') {
      analytics = await getAgentAnalytics(req.user.id);
    } else if (role === 'tenant') {
      analytics = await getTenantAnalytics(req.user.id);
    }

    res.json(analytics);
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin analytics
async function getAdminAnalytics() {
  const totalUsers = await User.countDocuments();
  const totalProperties = await Property.countDocuments();
  const totalTenants = await Tenant.countDocuments({ status: 'active' });
  
  const totalRevenue = await Payment.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  const propertiesByStatus = await Property.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  return {
    overview: {
      totalUsers,
      totalProperties,
      totalTenants,
      totalRevenue: totalRevenue[0]?.total || 0
    },
    usersByRole,
    propertiesByStatus
  };
}

// Agent analytics
async function getAgentAnalytics(agentId) {
  const properties = await Property.find({ agent: agentId }).select('_id');
  const propertyIds = properties.map(p => p._id);

  const totalProperties = propertyIds.length;
  const totalTenants = await Tenant.countDocuments({
    property: { $in: propertyIds },
    status: 'active'
  });

  const monthlyRevenue = await Payment.aggregate([
    { 
      $match: { 
        property: { $in: propertyIds },
        paymentDate: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      } 
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  return {
    overview: {
      totalProperties,
      totalTenants,
      monthlyRevenue: monthlyRevenue[0]?.total || 0
    }
  };
}

// Tenant analytics
async function getTenantAnalytics(userId) {
  const tenant = await Tenant.findOne({ user: userId })
    .populate('property')
    .populate('lease');

  if (!tenant) {
    return { message: 'No tenant record found' };
  }

  const payments = await Payment.find({ tenant: tenant._id })
    .sort({ createdAt: -1 })
    .limit(5);

  const totalPaid = await Payment.aggregate([
    { $match: { tenant: tenant._id } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  return {
    tenantInfo: tenant,
    totalPaid: totalPaid[0]?.total || 0,
    recentPayments: payments
  };
}

// Get revenue analytics
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    
    if (req.user.role === 'agent') {
      const properties = await Property.find({ agent: req.user.id }).select('_id');
      query.property = { $in: properties.map(p => p._id) };
    }

    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    const revenue = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paymentDate' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(revenue);
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get occupancy analytics
exports.getOccupancyAnalytics = async (req, res) => {
  try {
    const query = {};
    
    if (req.user.role === 'agent') {
      query.agent = req.user.id;
    }

    const properties = await Property.find(query);

    const totalUnits = properties.reduce((sum, p) => sum + p.maxOccupancy, 0);
    const occupiedUnits = properties.reduce((sum, p) => sum + p.currentOccupancy, 0);
    const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(2) : 0;

    res.json({
      totalProperties: properties.length,
      totalUnits,
      occupiedUnits,
      vacantUnits: totalUnits - occupiedUnits,
      occupancyRate
    });
  } catch (error) {
    console.error('Get occupancy analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};