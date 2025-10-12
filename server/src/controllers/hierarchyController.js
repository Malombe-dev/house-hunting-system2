// server/src/controllers/hierarchyController.js
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');
const Payment = require('../models/Payment');

/**
 * @desc    Get complete agent hierarchy
 * @route   GET /api/hierarchy/agents
 * @access  Private/Admin
 */
exports.getAgentHierarchy = async (req, res) => {
  try {
    // Find all agents and landlords
    const agents = await User.find({
      role: { $in: ['agent', 'landlord'] },
      isActive: true
    })
      .select('firstName lastName email role createdAt')
      .lean();

    // Get hierarchy data for each agent
    const hierarchyData = await Promise.all(
      agents.map(async (agent) => {
        // Get employees under this agent
        const employees = await User.find({
          createdBy: agent._id,
          role: 'employee'
        })
          .select('firstName lastName email jobTitle branch isActive')
          .lean();

        // Get properties managed by agent
        const properties = await Property.find({ agent: agent._id })
          .select('name status')
          .lean();

        // Get tenants
        const tenants = await Tenant.find({ agent: agent._id })
          .select('status')
          .lean();

        // Calculate stats
        const stats = {
          totalEmployees: employees.length,
          activeEmployees: employees.filter(e => e.isActive).length,
          totalProperties: properties.length,
          activeProperties: properties.filter(p => p.status === 'available').length,
          totalTenants: tenants.length,
          activeTenants: tenants.filter(t => t.status === 'active').length,
          occupancyRate: properties.length > 0 
            ? Math.round((tenants.filter(t => t.status === 'active').length / properties.length) * 100)
            : 0
        };

        return {
          agent,
          employees,
          stats
        };
      })
    );

    res.json({
      success: true,
      count: hierarchyData.length,
      data: hierarchyData
    });
  } catch (error) {
    console.error('Get agent hierarchy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent hierarchy',
      error: error.message
    });
  }
};

/**
 * @desc    Get specific agent details with their team
 * @route   GET /api/hierarchy/agent/:agentId
 * @access  Private/Admin or Own Agent
 */
exports.getAgentDetails = async (req, res) => {
  try {
    const { agentId } = req.params;

    // Check if user can access this data
    if (req.user.role !== 'admin' && req.user._id.toString() !== agentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this agent\'s details'
      });
    }

    // Get agent info
    const agent = await User.findById(agentId)
      .select('firstName lastName email role phone createdAt isActive');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Get employees
    const employees = await User.find({
      createdBy: agentId,
      role: 'employee'
    })
      .select('firstName lastName email jobTitle branch isActive createdAt')
      .lean();

    // Get employee stats
    const employeeStats = await Promise.all(
      employees.map(async (emp) => {
        const tenantsCreated = await Tenant.countDocuments({ createdBy: emp._id });
        const paymentsRecorded = await Payment.countDocuments({ recordedBy: emp._id });
        
        return {
          ...emp,
          tenantsCreated,
          paymentsRecorded
        };
      })
    );

    // Get properties
    const properties = await Property.find({ agent: agentId })
      .select('name location status rentAmount units')
      .lean();

    // Get tenants with details
    const tenants = await Tenant.find({ agent: agentId })
      .populate('user', 'firstName lastName email phone')
      .populate('property', 'name location')
      .populate('createdBy', 'firstName lastName')
      .select('status leaseStart leaseEnd rentAmount createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Calculate comprehensive stats
    const totalUnits = properties.reduce((sum, prop) => sum + (prop.units || 1), 0);
    const activeTenants = tenants.filter(t => t.status === 'active').length;
    
    const stats = {
      totalEmployees: employees.length,
      activeEmployees: employees.filter(e => e.isActive).length,
      totalProperties: properties.length,
      totalUnits,
      totalTenants: tenants.length,
      activeTenants,
      occupancyRate: totalUnits > 0 ? Math.round((activeTenants / totalUnits) * 100) : 0,
      totalRentExpected: tenants
        .filter(t => t.status === 'active')
        .reduce((sum, t) => sum + t.rentAmount, 0)
    };

    res.json({
      success: true,
      data: {
        agent,
        employees: employeeStats,
        properties,
        tenants,
        stats
      }
    });
  } catch (error) {
    console.error('Get agent details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent details',
      error: error.message
    });
  }
};

/**
 * @desc    Get employee statistics
 * @route   GET /api/hierarchy/employee/:employeeId
 * @access  Private/Admin or Parent Agent
 */
exports.getEmployeeStats = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get employee info
    const employee = await User.findById(employeeId)
      .select('firstName lastName email jobTitle branch createdBy createdAt isActive');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' && 
      req.user._id.toString() !== employee.createdBy?.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this employee\'s stats'
      });
    }

    // Get performance stats
    const tenantsCreated = await Tenant.countDocuments({ createdBy: employeeId });
    
    const paymentsRecorded = await Payment.countDocuments({ recordedBy: employeeId });
    
    const totalPaymentsAmount = await Payment.aggregate([
      { $match: { recordedBy: employee._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get recent activity
    const recentTenants = await Tenant.find({ createdBy: employeeId })
      .populate('user', 'firstName lastName')
      .populate('property', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentPayments = await Payment.find({ recordedBy: employeeId })
      .populate('tenant', 'user')
      .sort({ paymentDate: -1 })
      .limit(5)
      .lean();

    // Get parent agent info
    const parentAgent = await User.findById(employee.createdBy)
      .select('firstName lastName email role');

    const stats = {
      tenantsCreated,
      paymentsRecorded,
      totalPaymentsAmount: totalPaymentsAmount[0]?.total || 0,
      performanceScore: calculatePerformanceScore({
        tenantsCreated,
        paymentsRecorded,
        totalPaymentsAmount: totalPaymentsAmount[0]?.total || 0
      })
    };

    res.json({
      success: true,
      data: {
        employee,
        parentAgent,
        stats,
        recentActivity: {
          tenants: recentTenants,
          payments: recentPayments
        }
      }
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee stats',
      error: error.message
    });
  }
};

/**
 * @desc    Get billing summary for all agents
 * @route   GET /api/hierarchy/billing
 * @access  Private/Admin
 */
exports.getBillingSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to current month if no dates provided
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Get all agents/landlords
    const agents = await User.find({
      role: { $in: ['agent', 'landlord'] },
      isActive: true
    }).select('firstName lastName email role');

    // Calculate billing for each agent
    const billingSummary = await Promise.all(
      agents.map(async (agent) => {
        // Get payments collected
        const payments = await Payment.find({
          agent: agent._id,
          paymentDate: { $gte: start, $lte: end },
          status: 'completed'
        });

        const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
        const transactionCount = payments.length;

        // Commission calculation (example: 5% of rent collected)
        const commissionRate = 0.05;
        const platformFee = totalCollected * commissionRate;

        // Get property count
        const propertyCount = await Property.countDocuments({ agent: agent._id });
        
        // Get active tenant count
        const activeTenants = await Tenant.countDocuments({
          agent: agent._id,
          status: 'active'
        });

        return {
          agent: {
            _id: agent._id,
            name: `${agent.firstName} ${agent.lastName}`,
            email: agent.email,
            role: agent.role
          },
          period: { start, end },
          billing: {
            totalCollected,
            transactionCount,
            platformFee,
            netAmount: totalCollected - platformFee
          },
          metrics: {
            propertyCount,
            activeTenants,
            averageRentPerTenant: activeTenants > 0 ? totalCollected / activeTenants : 0
          }
        };
      })
    );

    // Calculate totals
    const totals = {
      totalCollected: billingSummary.reduce((sum, b) => sum + b.billing.totalCollected, 0),
      totalPlatformFees: billingSummary.reduce((sum, b) => sum + b.billing.platformFee, 0),
      totalTransactions: billingSummary.reduce((sum, b) => sum + b.billing.transactionCount, 0),
      totalProperties: billingSummary.reduce((sum, b) => sum + b.metrics.propertyCount, 0),
      totalActiveTenants: billingSummary.reduce((sum, b) => sum + b.metrics.activeTenants, 0)
    };

    res.json({
      success: true,
      period: { start, end },
      totals,
      agentBilling: billingSummary
    });
  } catch (error) {
    console.error('Get billing summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch billing summary',
      error: error.message
    });
  }
};

// Helper function to calculate performance score
function calculatePerformanceScore({ tenantsCreated, paymentsRecorded, totalPaymentsAmount }) {
  // Simple scoring algorithm
  const tenantScore = tenantsCreated * 10;
  const paymentScore = paymentsRecorded * 5;
  const amountScore = Math.floor(totalPaymentsAmount / 10000);
  
  return Math.min(100, tenantScore + paymentScore + amountScore);
}

module.exports = exports;