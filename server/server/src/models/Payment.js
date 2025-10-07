const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  tenant: {
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
  lease: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lease',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentType: {
    type: String,
    enum: ['rent', 'deposit', 'late_fee', 'utility', 'maintenance', 'other'],
    default: 'rent'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'mpesa', 'card', 'cheque'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date,
    default: null
  },
  paymentPeriod: {
    month: Number,
    year: Number
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  reference: String,
  lateFee: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  notes: String,
  receiptUrl: String,
  // For online payments
  paymentGatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    select: false
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
paymentSchema.index({ paidDate: -1 });
paymentSchema.index({ transactionId: 1 });

// Virtual for total amount including fees
paymentSchema.virtual('totalAmount').get(function() {
  return this.amount + this.lateFee - this.discount;
});

// Check if payment is overdue
paymentSchema.methods.isOverdue = function() {
  return new Date() > this.dueDate && this.status === 'pending';
};

// Mark as paid
paymentSchema.methods.markAsPaid = function(transactionId) {
  this.status = 'paid';
  this.paidDate = new Date();
  this.transactionId = transactionId;
  return this.save();
};

// Auto-update status if overdue
paymentSchema.pre('save', function(next) {
  if (this.isOverdue()) {
    this.status = 'overdue';
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;