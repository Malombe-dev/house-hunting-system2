// server/src/controllers/hierarchyController.js
const User = require('../models/User');
const Property = require('../models/Property');
const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');

// Get complete agent hierarchy (for Admin)
exports.getAgentHierarchy = async (req, res) => {
  try {
    // Only admins can view this
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all agents and landlords
    const agents = await User.find({ 
      role: { $in: ['agent', 'landlord'] },
      isActive: true 
    }).select('-password').sort({ createdAt: -1 });

    const hierarchy = [];

    for (const agent of agents) {
      // Get employees created by this agent
      const employees = await User.find({
        role: 'employee',
        parentUser: agent._id,
        isActive: true
      }).select('-password');

      // Get properties managed by agent
      const properties = await Property.find({ agent: agent._id });
      const propertyIds = properties.map(p => p._id);

      // Get tenants under this agent's properties
      const tenants = await Tenant.find({
        property: { $in: propertyIds }
      }).populate('user', 'firstName lastName email');

      // Calculate revenue for this agent
      const revenue = await Payment.aggregate([
        {
          $match: {
            property: { $in: propertyIds }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      // Get employees with their tenant counts
      const employeesWithStats = await Promise.all(
        employees.map(async (emp) => {
          const empTenants = await Tenant.find({
            createdBy: emp._id
          });

          return {
            ...emp.toObject(),
            tenantsCreated: empTenants.length,
            branch: emp.branch || 'Main Office',
            jobTitle: emp.jobTitle || 'Staff'
          };
        })
      );

      hierarchy.push({
        agent: {
          id: agent._id,
          name: `${agent.firstName} ${agent.lastName}`,
          email: agent.email,
          phone: agent.phone,
          role: agent.role,
          businessName: agent.businessName,
          businessLicense: agent.businessLicense,
          createdAt: agent.createdAt,
          accountId: agent._id.toString().slice(-8).toUpperCase() // Last 8 chars as ID
        },
        stats: {
          totalEmployees: employees.length,
          totalProperties: properties.length,
          totalTenants: tenants.length,
          totalRevenue: revenue[0]?.total || 0,
          totalPayments: revenue[0]?.count || 0
        },
        employees: employeesWithStats,
        recentTenants: tenants.slice(0, 5) // Last 5 tenants for preview
      });
    }

    res.json({
      success: true,
      hierarchy,
      summary: {
        totalAgents: agents.length,
        totalEmployees: hierarchy.reduce((sum, h) => sum + h.stats.totalEmployees, 0),
        totalProperties: hierarchy.reduce((sum, h) => sum + h.stats.totalProperties, 0),
        totalTenants: hierarchy.reduce((sum, h) => sum + h.stats.totalTenants, 0),
        totalRevenue: hierarchy.reduce((sum, h) => sum + h.stats.totalRevenue, 0)
      }
    });
  } catch (error) {
    console.error('Get agent hierarchy error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get specific agent's hierarchy (for Admin viewing or Agent viewing own)
exports.getAgentDetails = async (req, res) => {
  try {
    const { agentId } = req.params;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== agentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const agent = await User.findById(agentId).select('-password');
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Get employees
    const employees = await User.find({
      role: 'employee',
      parentUser: agentId,
      isActive: true
    }).select('-password');

    // Get properties
    const properties = await Property.find({ agent: agentId });
    const propertyIds = properties.map(p => p._id);

    // Get tenants
    const tenants = await Tenant.find({
      property: { $in: propertyIds }
    }).populate('user', 'firstName lastName email phone')
      .populate('property', 'name address');

    // Monthly revenue breakdown
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          property: { $in: propertyIds },
          paymentDate: { $gte: new Date(new Date().getFullYear(), 0, 1) }
        }
      },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      agent: {
        ...agent.toObject(),
        accountId: agent._id.toString().slice(-8).toUpperCase()
      },
      employees,
      properties,
      tenants,
      stats: {
        totalEmployees: employees.length,
        totalProperties: properties.length,
        totalTenants: tenants.length,
        activeProperties: properties.filter(p => p.status === 'available' || p.status === 'occupied').length,
        occupancyRate: properties.length > 0 
          ? ((properties.reduce((sum, p) => sum + p.currentOccupancy, 0) / 
              properties.reduce((sum, p) => sum + p.maxOccupancy, 0)) * 100).toFixed(2)
          : 0
      },
      monthlyRevenue
    });
  } catch (error) {
    console.error('Get agent details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get employee's stats (for Agent viewing their employees)
exports.getEmployeeStats = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Check if user is the parent agent/landlord
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (req.user.role !== 'admin' && employee.parentUser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get tenants created by this employee
    const tenants = await Tenant.find({
      createdBy: employeeId
    }).populate('user', 'firstName lastName email')
      .populate('property', 'name address');

    // Get properties managed by agent
    const properties = await Property.find({ agent: employee.parentUser });
    const propertyIds = properties.map(p => p._id);

    // Get payments recorded by this employee
    const payments = await Payment.find({
      recordedBy: employeeId,
      property: { $in: propertyIds }
    });

    res.json({
      success: true,
      employee: {
        id: employee._id,
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        phone: employee.phone,
        jobTitle: employee.jobTitle,
        branch: employee.branch,
        employeeId: employee.employeeId,
        permissions: employee.permissions
      },
      stats: {
        tenantsCreated: tenants.length,
        paymentsRecorded: payments.length,
        totalPaymentsAmount: payments.reduce((sum, p) => sum + p.amount, 0)
      },
      recentTenants: tenants.slice(0, 10)
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get billing summary (for Admin)
exports.getBillingSummary = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { startDate, endDate } = req.query;
    const dateFilter = {};
    
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const agents = await User.find({ 
      role: { $in: ['agent', 'landlord'] },
      isActive: true 
    }).select('-password');

    const billingData = [];

    for (const agent of agents) {
      const employees = await User.countDocuments({
        role: 'employee',
        parentUser: agent._id,
        isActive: true
      });

      const properties = await Property.countDocuments({ agent: agent._id });

      const query = { agent: agent._id };
      if (Object.keys(dateFilter).length > 0) {
        query.createdAt = dateFilter;
      }
      
      const tenants = await Tenant.countDocuments({
        property: { $in: await Property.find({ agent: agent._id }).select('_id') }
      });

      // Calculate billing based on your pricing model
      // Example: $10 per employee + $5 per property + $2 per tenant
      const billing = {
        employeeFee: employees * 10,
        propertyFee: properties * 5,
        tenantFee: tenants * 2,
        total: (employees * 10) + (properties * 5) + (tenants * 2)
      };

      billingData.push({
        agent: {
          id: agent._id,
          name: `${agent.firstName} ${agent.lastName}`,
          email: agent.email,
          businessName: agent.businessName,
          accountId: agent._id.toString().slice(-8).toUpperCase()
        },
        counts: {
          employees,
          properties,
          tenants
        },
        billing
      });
    }

    const totalBilling = billingData.reduce((sum, b) => sum + b.billing.total, 0);

    res.json({
      success: true,
      billingData,
      summary: {
        totalAgents: agents.length,
        totalBilling,
        averageBillingPerAgent: agents.length > 0 ? (totalBilling / agents.length).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Get billing summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

