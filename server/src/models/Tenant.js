const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leaseStart: {
    type: Date,
    required: [true, 'Lease start date is required']
  },
  leaseEnd: {
    type: Date,
    required: [true, 'Lease end date is required']
  },
  monthlyRent: {
    type: Number,
    required: [true, 'Monthly rent is required'],
    min: [0, 'Rent cannot be negative']
  },
  depositPaid: {
    type: Number,
    required: [true, 'Deposit amount is required'],
    min: [0, 'Deposit cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'terminated', 'pending'],
    default: 'pending'
  },
  // Tenant details
  idNumber: {
    type: String,
    required: [true, 'ID number is required']
  },
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    }
  },
  // Lease terms
  noticePeriod: {
    type: Number,
    default: 30, // days
    min: [0, 'Notice period cannot be negative']
  },
  rentDueDay: {
    type: Number,
    default: 1, // 1st of every month
    min: [1, 'Day must be between 1 and 31'],
    max: [31, 'Day must be between 1 and 31']
  },
  // Lease agreement document
  leaseAgreement: {
    type: String, // URL to PDF
    default: null
  },
  // Move in/out details
  moveInDate: {
    type: Date,
    default: null
  },
  moveOutDate: {
    type: Date,
    default: null
  },
  moveInCondition: {
    type: String,
    default: null
  },
  moveOutCondition: {
    type: String,
    default: null
  },
  // Payment history summary
  totalPaid: {
    type: Number,
    default: 0
  },
  outstandingBalance: {
    type: Number,
    default: 0
  },
  lastPaymentDate: {
    type: Date,
    default: null
  },
  // Additional notes
  notes: {
    type: String,
    default: null
  },
  // Termination details
  terminatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  terminationReason: {
    type: String,
    default: null
  },
  terminationDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
tenantSchema.index({ user: 1 });
tenantSchema.index({ property: 1 });
tenantSchema.index({ agent: 1 });
tenantSchema.index({ status: 1 });
tenantSchema.index({ leaseEnd: 1 });
tenantSchema.index({ createdAt: -1 });

// Virtual for lease duration in months
tenantSchema.virtual('leaseDuration').get(function() {
  if (!this.leaseStart || !this.leaseEnd) return 0;
  const months = (this.leaseEnd - this.leaseStart) / (1000 * 60 * 60 * 24 * 30);
  return Math.round(months);
});

// Virtual for days until lease expiry
tenantSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.leaseEnd) return null;
  const today = new Date();
  const days = Math.ceil((this.leaseEnd - today) / (1000 * 60 * 60 * 24));
  return days;
});

// Method to check if lease is expiring soon
tenantSchema.methods.isExpiringSoon = function(days = 30) {
  const daysRemaining = this.daysUntilExpiry;
  return daysRemaining !== null && daysRemaining > 0 && daysRemaining <= days;
};

// Method to update payment summary
tenantSchema.methods.updatePaymentSummary = async function() {
  const Payment = mongoose.model('Payment');
  const payments = await Payment.find({ 
    tenant: this._id, 
    status: 'paid' 
  });
  
  this.totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate outstanding balance
  const allPayments = await Payment.find({ tenant: this._id });
  this.outstandingBalance = allPayments
    .filter(p => p.status === 'overdue' || p.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  // Get last payment date
  const lastPayment = payments.sort((a, b) => b.paidDate - a.paidDate)[0];
  this.lastPaymentDate = lastPayment ? lastPayment.paidDate : null;
  
  return this.save();
};

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;