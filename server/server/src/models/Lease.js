const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  rentAmount: {
    type: Number,
    required: true
  },
  depositAmount: {
    type: Number,
    required: true
  },
  paymentDueDate: {
    type: Number, // Day of month (1-31)
    required: true,
    min: 1,
    max: 31
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'terminated', 'renewed'],
    default: 'pending'
  },
  terms: {
    noticePeriod: {
      type: Number, // Days
      default: 30
    },
    lateFeePercentage: {
      type: Number,
      default: 5
    },
    gracePeriodDays: {
      type: Number,
      default: 3
    },
    petsAllowed: {
      type: Boolean,
      default: false
    },
    smokingAllowed: {
      type: Boolean,
      default: false
    },
    sublettingAllowed: {
      type: Boolean,
      default: false
    }
  },
  utilities: [{
    name: String,
    includedInRent: Boolean,
    estimatedCost: Number
  }],
  renewalOptions: {
    autoRenew: {
      type: Boolean,
      default: false
    },
    renewalNoticeDays: {
      type: Number,
      default: 60
    }
  },
  documentUrl: {
    type: String, // PDF document link
    default: null
  },
  signedByTenant: {
    type: Boolean,
    default: false
  },
  signedByAgent: {
    type: Boolean,
    default: false
  },
  tenantSignatureDate: Date,
  agentSignatureDate: Date,
  terminationReason: String,
  terminationDate: Date,
  terminatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
leaseSchema.index({ tenant: 1 });
leaseSchema.index({ property: 1 });
leaseSchema.index({ agent: 1 });
leaseSchema.index({ status: 1 });
leaseSchema.index({ endDate: 1 });

// Virtual for lease duration in months
leaseSchema.virtual('durationMonths').get(function() {
  const months = (this.endDate - this.startDate) / (1000 * 60 * 60 * 24 * 30);
  return Math.round(months);
});

// Virtual for days remaining
leaseSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const diffTime = this.endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Check if lease is expired
leaseSchema.methods.isExpired = function() {
  return new Date() > this.endDate;
};

// Auto-update status if expired
leaseSchema.pre('save', function(next) {
  if (this.isExpired() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

const Lease = mongoose.model('Lease', leaseSchema);

module.exports = Lease;