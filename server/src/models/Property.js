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
    enum: ['apartment', 'house', 'studio', 'commercial', 'land']
  },
  rent: {
    type: Number,
    required: [true, 'Monthly rent is required'],
    min: [0, 'Rent cannot be negative']
  },
  deposit: {
    type: Number,
    default: 0,
    min: [0, 'Deposit cannot be negative']
  },
  bedrooms: {
    type: Number,
    required: true,
    min: [0, 'Bedrooms cannot be negative']
  },
  bathrooms: {
    type: Number,
    required: true,
    min: [1, 'Must have at least 1 bathroom']
  },
  area: {
    type: Number,
    required: [true, 'Area is required'],
    min: [10, 'Area must be at least 10 square meters']
  },
  floor: {
    type: Number,
    default: null
  },
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
      latitude: Number,
      longitude: Number
    }
  },
  images: [{
    type: String
  }],
  features: [{
    type: String,
    enum: [
      'parking', 'garden', 'swimming_pool', 'gym', 'security',
      'elevator', 'balcony', 'furnished', 'air_conditioning',
      'internet', 'water_backup', 'generator'
    ]
  }],
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
  availability: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'unavailable'],
    default: 'available'
  },
  featured: {
    type: Boolean,
    default: false
  },
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
  // Admin approval
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
  }
}, {
  timestamps: true
});

// Indexes for faster queries
propertySchema.index({ agent: 1 });
propertySchema.index({ tenant: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ availability: 1 });
propertySchema.index({ rent: 1 });
propertySchema.index({ 'location.city': 1 });
propertySchema.index({ 'location.area': 1 });
propertySchema.index({ createdAt: -1 });
propertySchema.index({ featured: 1, createdAt: -1 });

// Text index for search
propertySchema.index({
  title: 'text',
  description: 'text',
  'location.address': 'text',
  'location.area': 'text'
});

// Virtual for monthly income (if occupied)
propertySchema.virtual('monthlyIncome').get(function() {
  return this.availability === 'occupied' ? this.rent : 0;
});

// Increment view count
propertySchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Increment inquiries count
propertySchema.methods.incrementInquiries = function() {
  this.inquiries += 1;
  return this.save();
};

// Increment applications count
propertySchema.methods.incrementApplications = function() {
  this.applications += 1;
  return this.save();
};

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;