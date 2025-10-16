const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [50, 'Description must be at least 50 characters']
  },
  
  propertyType: {
    type: String,
    required: true,
    enum: [
      // Residential Types
      'apartment',
      'house',
      'bedsitter', 
      'single_room',
      'studio',
      'bungalow',
      'maisonette',
      
      // Commercial Types
      'commercial',
      'office_space',
      'shop',
      'warehouse',
      
      // Special Types
      'hostel',
      'service_apartment',
      
      // Land Types
      'land',
      'plot',
      'farm'
    ]
  },
  
  // Pricing
  rent: {
    type: Number,
    min: [0, 'Rent cannot be negative'],
    required: function() {
      // Rent is required for non-land types
      return !['land', 'plot', 'farm'].includes(this.propertyType);
    }
  },
  deposit: {
    type: Number,
    default: 0,
    min: [0, 'Deposit cannot be negative']
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    required: function() {
      // Price is required for land types
      return ['land', 'plot', 'farm'].includes(this.propertyType);
    }
  },
  priceType: {
    type: String,
    enum: ['total', 'per_acre', 'negotiable'],
    default: 'total'
  },
  
  // Basic Property Details
  bedrooms: {
    type: Number,
    min: [0, 'Bedrooms cannot be negative'],
    default: 0
  },
  bathrooms: {
    type: Number,
    min: [0, 'Bathrooms cannot be negative'],
    default: 0
  },
  area: {
    type: Number,
    required: [true, 'Area/Size is required'],
    min: [0.01, 'Area must be greater than 0']
  },
  
  // Dynamic Fields for Different Property Types
  // Apartment/Office specific
  floor: {
    type: Number,
    default: null
  },
  buildingName: {
    type: String,
    trim: true
  },
  
  // House/Land specific
  plotSize: {
    type: Number, // in acres
    min: [0.01, 'Plot size must be greater than 0']
  },
  landSize: {
    type: Number, // in acres
    min: [0.01, 'Land size must be greater than 0']
  },
  farmSize: {
    type: Number, // in acres
    min: [0.01, 'Farm size must be greater than 0']
  },
  compound: {
    type: String,
    trim: true
  },
  
  // Maisonette specific
  floors: {
    type: Number,
    min: [1, 'Must have at least 1 floor']
  },
  
  // Shared facilities (for bedsitter/single room)
  sharedBathroom: {
    type: Boolean,
    default: false
  },
  sharedKitchen: {
    type: Boolean,
    default: false
  },
  
  // Commercial specific
  businessType: {
    type: String,
    trim: true
  },
  floorArea: {
    type: Number
  },
  officeType: {
    type: String,
    trim: true
  },
  receptionArea: {
    type: Boolean,
    default: false
  },
  
  // Shop specific
  shopType: {
    type: String,
    trim: true
  },
  displayWindows: {
    type: Boolean,
    default: false
  },
  storageRoom: {
    type: Boolean,
    default: false
  },
  
  // Warehouse specific
  warehouseType: {
    type: String,
    trim: true
  },
  loadingBay: {
    type: Boolean,
    default: false
  },
  ceilingHeight: {
    type: Number // in meters
  },
  
  // Hostel specific
  sharedFacilities: {
    type: String,
    trim: true
  },
  roomsCount: {
    type: Number
  },
  commonAreas: {
    type: String,
    trim: true
  },
  
  // Service Apartment specific
  servicesIncluded: {
    type: String,
    trim: true
  },
  
  // Land specific
  zoning: {
    type: String,
    trim: true
  },
  topography: {
    type: String,
    trim: true
  },
  utilities: {
    type: String,
    trim: true
  },
  farmType: {
    type: String,
    trim: true
  },
  waterSource: {
    type: String,
    trim: true
  },
  
  // Location
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    area: {
      type: String,
      required: [true, 'Area/Neighborhood is required']
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required']
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required']
      }
    }
  },
  
  // Media
  images: [{
    type: String
  }],
  
  // Property Features
  features: [{
    type: String,
    enum: [
      // Regular property features
      'parking', 'garden', 'swimming_pool', 'gym', 'security',
      'elevator', 'balcony', 'furnished', 'air_conditioning',
      'internet', 'water_backup', 'generator',
      // Land features
      'fenced', 'water_connection', 'electricity', 'road_access',
      'title_deed', 'near_tarmac', 'agricultural', 'residential_zoning',
      'commercial_zoning', 'water_source', 'fertile_soil', 'irrigation'
    ]
  }],
  
  // Additional Property Info
  furnished: {
    type: Boolean,
    default: false
  },
  petsAllowed: {
    type: Boolean,
    default: false
  },
  smokingAllowed: {
    type: Boolean,
    default: false
  },
  
  // Status
  availability: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'unavailable'],
    default: 'available'
  },
  featured: {
    type: Boolean,
    default: false
  },
  
  // Relationships
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Created by (to track if employee created it)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByRole: {
    type: String,
    enum: ['agent', 'employee', 'admin'],
    required: true
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  },
  
  // Approval System
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
propertySchema.index({ agent: 1 });
propertySchema.index({ createdBy: 1 });
propertySchema.index({ tenant: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ availability: 1 });
propertySchema.index({ rent: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ 'location.city': 1 });
propertySchema.index({ 'location.area': 1 });
propertySchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
propertySchema.index({ createdAt: -1 });
propertySchema.index({ featured: 1, createdAt: -1 });
propertySchema.index({ approvalStatus: 1 });
propertySchema.index({ approved: 1 });

// Compound indexes
propertySchema.index({ propertyType: 1, 'location.city': 1, availability: 1 });
propertySchema.index({ rent: 1, bedrooms: 1, propertyType: 1 });

// Text index for search
propertySchema.index({
  title: 'text',
  description: 'text',
  'location.address': 'text',
  'location.area': 'text',
  'location.city': 'text'
});

// Virtual for monthly income (if occupied)
propertySchema.virtual('monthlyIncome').get(function() {
  return this.availability === 'occupied' ? this.rent : 0;
});

// Virtual to check if it's a land type
propertySchema.virtual('isLandType').get(function() {
  return ['land', 'plot', 'farm'].includes(this.propertyType);
});

// Pre-save middleware to auto-approve if created by agent
propertySchema.pre('save', function(next) {
  if (this.isNew) {
    // Auto-approve if created by agent or admin
    if (this.createdByRole === 'agent' || this.createdByRole === 'admin') {
      this.approved = true;
      this.approvalStatus = 'approved';
      this.approvedBy = this.createdBy;
      this.approvedAt = new Date();
    } else {
      // Employee-created properties need approval
      this.approved = false;
      this.approvalStatus = 'pending';
    }
  }
  next();
});

// Methods
propertySchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

propertySchema.methods.incrementInquiries = function() {
  this.inquiries += 1;
  return this.save();
};

propertySchema.methods.incrementApplications = function() {
  this.applications += 1;
  return this.save();
};

propertySchema.methods.approve = function(approver) {
  this.approved = true;
  this.approvalStatus = 'approved';
  this.approvedBy = approver._id;
  this.approvedAt = new Date();
  this.rejectionReason = null;
  return this.save();
};

propertySchema.methods.reject = function(approver, reason) {
  this.approved = false;
  this.approvalStatus = 'rejected';
  this.approvedBy = approver._id;
  this.approvedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

// Static methods
propertySchema.statics.findPendingApprovals = function() {
  return this.find({ approvalStatus: 'pending' })
    .populate('createdBy', 'firstName lastName email')
    .sort('-createdAt');
};

propertySchema.statics.findByAgent = function(agentId) {
  return this.find({ agent: agentId })
    .sort('-createdAt');
};

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;