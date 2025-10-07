const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [20, 'Description must be at least 20 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['plumbing', 'electrical', 'hvac', 'appliances', 'general', 'cleaning', 'security']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  images: [{
    type: String
  }],
  // Assignment
  assignedTo: {
    name: String,
    phone: String,
    company: String
  },
  assignedDate: {
    type: Date,
    default: null
  },
  // Scheduling
  scheduledDate: {
    type: Date,
    default: null
  },
  estimatedCompletion: {
    type: Date,
    default: null
  },
  completedDate: {
    type: Date,
    default: null
  },
  // Cost
  estimatedCost: {
    type: Number,
    default: 0,
    min: [0, 'Cost cannot be negative']
  },
  actualCost: {
    type: Number,
    default: 0,
    min: [0, 'Cost cannot be negative']
  },
  // Updates and communication
  updates: [{
    message: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Tenant feedback (after completion)
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  feedback: {
    type: String,
    default: null
  },
  // Contact preference
  contactMethod: {
    type: String,
    enum: ['phone', 'email', 'sms'],
    default: 'phone'
  },
  // Cancellation
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
maintenanceSchema.index({ tenant: 1 });
maintenanceSchema.index({ property: 1 });
maintenanceSchema.index({ agent: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ priority: 1 });
maintenanceSchema.index({ category: 1 });
maintenanceSchema.index({ createdAt: -1 });
maintenanceSchema.index({ scheduledDate: 1 });

// Virtual for duration (time to complete)
maintenanceSchema.virtual('duration').get(function() {
  if (!this.completedDate || !this.createdAt) return null;
  const diffTime = this.completedDate - this.createdAt;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
});

// Method to add update
maintenanceSchema.methods.addUpdate = function(message, authorId) {
  this.updates.push({
    message,
    author: authorId,
    createdAt: new Date()
  });
  return this.save();
};

// Method to assign technician
maintenanceSchema.methods.assignTechnician = function(technicianDetails) {
  this.assignedTo = technicianDetails;
  this.assignedDate = new Date();
  this.status = 'in_progress';
  return this.save();
};

// Method to mark as completed
maintenanceSchema.methods.markAsCompleted = function(actualCost) {
  this.status = 'completed';
  this.completedDate = new Date();
  if (actualCost) this.actualCost = actualCost;
  return this.save();
};

// Method to add feedback
maintenanceSchema.methods.addFeedback = function(rating, feedback) {
  this.rating = rating;
  this.feedback = feedback;
  return this.save();
};

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

module.exports = Maintenance;