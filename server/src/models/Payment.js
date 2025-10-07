const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
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
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  paymentType: {
    type: String,
    enum: ['rent', 'deposit', 'utility', 'maintenance', 'late_fee', 'other'],
    default: 'rent'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'mpesa', 'card', 'cheque'],
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue', 'failed', 'refunded'],
    default: 'pending'
  },
  // Payment period
  paymentFor: {
    month: {
      type: Number,
      min: 1,
      max: 12
    },
    year: {
      type: Number
    }
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date,
    default: null
  },
  // Transaction details
  transactionId: {
    type: String,
    default: null
  },
  reference: {
    type: String,
    default: null
  },
  // Late payment
  lateFee: {
    type: Number,
    default: 0,
    min: [0, 'Late fee cannot be negative']
  },
  daysOverdue: {
    type: Number,
    default: 0,
    min: [0, 'Days overdue cannot be negative']
  },
  // Receipt
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  receiptUrl: {
    type: String,
    default: null
  },
  // Notes
  notes: {
    type: String,
    default: null
  },
  // Refund details (if applicable)
  refundAmount: {
    type: Number,
    default: 0
  },
  refundDate: {
    type: Date,
    default: null
  },
  refundReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ tenant: 1 });
paymentSchema.index({ property: 1 });
paymentSchema.index({ agent: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ dueDate: 1 });
paymentSchema.index({ paidDate: 1 });
paymentSchema.index({ receiptNumber: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ 'paymentFor.month': 1, 'paymentFor.year': 1 });

// Generate receipt number before saving
paymentSchema.pre('save', async function(next) {
  if (this.isNew && this.status === 'paid' && !this.receiptNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Payment').countDocuments({ 
      receiptNumber: { $regex: `^RCP-${year}${month}` } 
    });
    this.receiptNumber = `RCP-${year}${month}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Virtual for checking if payment is overdue
paymentSchema.virtual('isOverdue').get(function() {
  if (this.status === 'paid') return false;
  return new Date() > this.dueDate;
});

// Method to calculate days overdue
paymentSchema.methods.calculateDaysOverdue = function() {
  if (this.status === 'paid' || !this.isOverdue) return 0;
  const today = new Date();
  const diffTime = Math.abs(today - this.dueDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Method to mark as paid
paymentSchema.methods.markAsPaid = async function(paymentDetails) {
  this.status = 'paid';
  this.paidDate = new Date();
  this.transactionId = paymentDetails.transactionId;
  this.paymentMethod = paymentDetails.paymentMethod;
  this.reference = paymentDetails.reference;
  this.daysOverdue = this.calculateDaysOverdue();
  
  return this.save();
};

// Method to calculate late fee
paymentSchema.methods.calculateLateFee = function(ratePerDay = 50) {
  if (!this.isOverdue) return 0;
  const daysOverdue = this.calculateDaysOverdue();
  return daysOverdue * ratePerDay;
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;