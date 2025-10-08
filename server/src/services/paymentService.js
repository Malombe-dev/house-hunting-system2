// server/src/services/paymentService.js
const Payment = require('../models/Payment');
const Tenant = require('../models/Tenant');
const { sendPaymentConfirmationEmail } = require('./emailService');

// Process M-Pesa payment
const processMpesaPayment = async (paymentData) => {
  try {
    // TODO: Integrate with actual M-Pesa API
    // This is a placeholder implementation
    
    const {
      phoneNumber,
      amount,
      accountReference,
      transactionDesc
    } = paymentData;

    // Simulate M-Pesa STK Push
    const response = {
      success: true,
      transactionId: `MPX${Date.now()}`,
      message: 'Payment initiated successfully'
    };

    return response;
  } catch (error) {
    console.error('M-Pesa payment error:', error);
    throw error;
  }
};

// Verify M-Pesa payment
const verifyMpesaPayment = async (transactionId) => {
  try {
    // TODO: Implement actual M-Pesa verification
    // Query M-Pesa API to verify transaction status
    
    const response = {
      success: true,
      transactionId,
      amount: 10000,
      status: 'completed'
    };

    return response;
  } catch (error) {
    console.error('M-Pesa verification error:', error);
    throw error;
  }
};

// Record payment
const recordPayment = async (paymentData, userId) => {
  try {
    const payment = new Payment({
      ...paymentData,
      recordedBy: userId,
      status: 'completed'
    });

    await payment.save();

    // Send confirmation email
    const tenant = await Tenant.findById(payment.tenant).populate('user');
    if (tenant) {
      await sendPaymentConfirmationEmail(payment, tenant);
    }

    return payment;
  } catch (error) {
    console.error('Record payment error:', error);
    throw error;
  }
};

// Calculate payment summary
const calculatePaymentSummary = async (tenantId, startDate, endDate) => {
  try {
    const query = { tenant: tenantId };
    
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query);
    
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const paymentCount = payments.length;
    const averagePayment = paymentCount > 0 ? totalPaid / paymentCount : 0;

    const byMonth = {};
    payments.forEach(payment => {
      const month = payment.forMonth || new Date(payment.paymentDate).toISOString().slice(0, 7);
      if (!byMonth[month]) {
        byMonth[month] = {
          month,
          amount: 0,
          count: 0
        };
      }
      byMonth[month].amount += payment.amount;
      byMonth[month].count += 1;
    });

    return {
      totalPaid,
      paymentCount,
      averagePayment,
      byMonth: Object.values(byMonth)
    };
  } catch (error) {
    console.error('Calculate payment summary error:', error);
    throw error;
  }
};

// Check overdue payments
const checkOverduePayments = async () => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);

    // Get all active tenants
    const tenants = await Tenant.find({ status: 'active' })
      .populate('user')
      .populate('lease');

    const overduePayments = [];

    for (const tenant of tenants) {
      // Check if payment exists for current month
      const payment = await Payment.findOne({
        tenant: tenant._id,
        forMonth: currentMonth
      });

      if (!payment && tenant.lease) {
        const daysOverdue = Math.floor(
          (currentDate - new Date(tenant.lease.rentDueDate)) / (1000 * 60 * 60 * 24)
        );

        if (daysOverdue > 0) {
          overduePayments.push({
            tenant: tenant,
            daysOverdue,
            amountDue: tenant.lease.rentAmount
          });
        }
      }
    }

    return overduePayments;
  } catch (error) {
    console.error('Check overdue payments error:', error);
    throw error;
  }
};

// Generate payment report
const generatePaymentReport = async (filters) => {
  try {
    const { startDate, endDate, propertyId, tenantId } = filters;
    
    const query = {};
    
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }
    
    if (propertyId) query.property = propertyId;
    if (tenantId) query.tenant = tenantId;

    const payments = await Payment.find(query)
      .populate('tenant')
      .populate('property')
      .sort({ paymentDate: -1 });

    const summary = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      byMethod: {},
      byMonth: {}
    };

    payments.forEach(payment => {
      // By payment method
      if (!summary.byMethod[payment.paymentMethod]) {
        summary.byMethod[payment.paymentMethod] = {
          count: 0,
          amount: 0
        };
      }
      summary.byMethod[payment.paymentMethod].count += 1;
      summary.byMethod[payment.paymentMethod].amount += payment.amount;

      // By month
      const month = new Date(payment.paymentDate).toISOString().slice(0, 7);
      if (!summary.byMonth[month]) {
        summary.byMonth[month] = {
          count: 0,
          amount: 0
        };
      }
      summary.byMonth[month].count += 1;
      summary.byMonth[month].amount += payment.amount;
    });

    return {
      payments,
      summary
    };
  } catch (error) {
    console.error('Generate payment report error:', error);
    throw error;
  }
};

module.exports = {
  processMpesaPayment,
  verifyMpesaPayment,
  recordPayment,
  calculatePaymentSummary,
  checkOverduePayments,
  generatePaymentReport
};