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
  lease: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lease',
    required: true
  },
  moveInDate: {
    type: Date,
    required: true
  },
  moveOutDate: {
    type: Date,
    default: null
  },
  rentAmount: {
    type: Number,
    required: true
  },
  depositAmount: {
    type: Number,
    required: true
  },
  depositStatus: {
    type: String,
    enum: ['held', 'returned', 'forfeited'],
    default: 'held'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated'],
    default: 'active'
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  employmentInfo: {
    employer: String,
    position: String,
    salary: Number,
    employmentLetter: String
  },
  references: [{
    name: String,
    phone: String,
    relationship: String
  }],
  identificationDocs: [{
    type: String,
    docUrl: String
  }],
  paymentHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }],
  maintenanceRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Maintenance'
  }],
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
tenantSchema.index({ user: 1 });
tenantSchema.index({ property: 1 });
tenantSchema.index({ status: 1 });
tenantSchema.index({ moveInDate: -1 });

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;