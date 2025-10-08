// server/src/controllers/paymentController.js
const Payment = require('../models/Payment');
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const { tenant, property, lease, amount, paymentMethod, transactionId, paymentDate, forMonth, notes } = req.body;

    const tenantExists = await Tenant.findById(tenant);
    if (!tenantExists) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const payment = new Payment({
      tenant,
      property,
      lease,
      amount,
      paymentMethod,
      transactionId,
      paymentDate: paymentDate || Date.now(),
      forMonth,
      status: 'completed',
      notes,
      recordedBy: req.user.id
    });

    await payment.save();
    res.status(201).json({ message: 'Payment recorded successfully', payment });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const { tenant, property, status, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (req.user.role === 'agent') {
      const properties = await Property.find({ agent: req.user.id }).select('_id');
      query.property = { $in: properties.map(p => p._id) };
    } else if (req.user.role === 'tenant') {
      const tenantRecord = await Tenant.findOne({ user: req.user.id });
      if (tenantRecord) query.tenant = tenantRecord._id;
    }

    if (tenant) query.tenant = tenant;
    if (property) query.property = property;
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate({ path: 'tenant', populate: { path: 'user', select: 'firstName lastName email' } })
      .populate('property', 'name address')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ paymentDate: -1 });

    const count = await Payment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({ path: 'tenant', populate: { path: 'user' } })
      .populate('property')
      .populate('lease');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update payment
exports.updatePayment = async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId, status, notes } = req.body;
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (amount) payment.amount = amount;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (transactionId) payment.transactionId = transactionId;
    if (status) payment.status = status;
    if (notes) payment.notes = notes;

    await payment.save();
    res.json({ message: 'Payment updated successfully', payment });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    await payment.deleteOne();
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get payment statistics
exports.getPaymentStats = async (req, res) => {
  try {
    const query = {};
    
    if (req.user.role === 'agent') {
      const properties = await Property.find({ agent: req.user.id }).select('_id');
      query.property = { $in: properties.map(p => p._id) };
    }

    const stats = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalPayments: { $sum: 1 },
          averagePayment: { $avg: '$amount' }
        }
      }
    ]);

    res.json(stats[0] || { totalRevenue: 0, totalPayments: 0, averagePayment: 0 });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get monthly revenue
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const query = {
      paymentDate: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`)
      }
    };

    if (req.user.role === 'agent') {
      const properties = await Property.find({ agent: req.user.id }).select('_id');
      query.property = { $in: properties.map(p => p._id) };
    }

    const revenue = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(revenue);
  } catch (error) {
    console.error('Get monthly revenue error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};