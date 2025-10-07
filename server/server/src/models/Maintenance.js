const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    minlength: 20
  },
  category: {
    type: String,
    required: true,
    enum: ['plumbing', 'electrical', 'hvac', 'appliances', 'general', 'cleaning', 'security', 'pest_control']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  images: [{
    type: String
  }],
  assignedTo: {
    name: String,
    phone: String,
    company: String
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  actualCost: {
    type: Number,
    default: 0
  },
  estimatedCompletionDate: Date,
  completedDate: Date,
  scheduledDate: Date,
  contactMethod: {
    type: String,
    enum: ['phone', 'email', 'sms'],
    default: 'phone'
  },
  updates: [{
    message: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  feedback: String,
  invoiceUrl: String
}, {
  timestamps: true
});

// Indexes
maintenanceSchema.index({ property: 1 });
maintenanceSchema.index({ tenant: 1 });
maintenanceSchema.index({ agent: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ priority: 1 });
maintenanceSchema.index({ createdAt: -1 });

// Add update/comment
maintenanceSchema.methods.addUpdate = function(message, authorId) {
  this.updates.push({
    message,
    author: authorId,
    createdAt: new Date()
  });
  return this.save();
};

// Mark as completed
maintenanceSchema.methods.markAsCompleted = function(actualCost) {
  this.status = 'completed';
  this.completedDate = new Date();
  if (actualCost) this.actualCost = actualCost;
  return this.save();
};

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

module.exports = Maintenance;