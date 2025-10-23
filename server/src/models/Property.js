const mongoose = require('mongoose');

// Unit Sub-Schema
const unitSchema = new mongoose.Schema({
  unitNumber: {
    type: String,
    required: [true, 'Unit number is required'],
    trim: true
  },
  floor: {
    type: Number,
    default: null
  },
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
    min: [0.01, 'Area must be greater than 0']
  },
  rent: {
    type: Number,
    required: [true, 'Rent is required for each unit'],
    min: [0, 'Rent cannot be negative']
  },
  deposit: {
    type: Number,
    default: 0,
    min: [0, 'Deposit cannot be negative']
  },
  furnished: {
    type: Boolean,
    default: false
  },
  features: [{
    type: String
  }],
  availability: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  leaseStart: {
    type: Date,
    default: null
  },
  leaseEnd: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

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
  
  // ✅ NEW: Property can have multiple units
  hasUnits: {
    type: Boolean,
    default: false,
    comment: 'True for properties with multiple rentable units (apartments, hostels, etc.)'
  },
  
  units: [unitSchema],
  
  // Pricing (for properties without units)
  rent: {
    type: Number,
    min: [0, 'Rent cannot be negative'],
    required: function() {
      // Rent is required only if property has NO units and is not land
      return !this.hasUnits && !['land', 'plot', 'farm'].includes(this.propertyType);
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
  
  // Basic Property Details (for properties without units)
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
  floor: {
    type: Number,
    default: null
  },
  buildingName: {
    type: String,
    trim: true
  },
  plotSize: {
    type: Number,
    min: [0.01, 'Plot size must be greater than 0']
  },
  landSize: {
    type: Number,
    min: [0.01, 'Land size must be greater than 0']
  },
  farmSize: {
    type: Number,
    min: [0.01, 'Farm size must be greater than 0']
  },
  compound: {
    type: String,
    trim: true
  },
  floors: {
    type: Number,
    min: [1, 'Must have at least 1 floor']
  },
  sharedBathroom: {
    type: Boolean,
    default: false
  },
  sharedKitchen: {
    type: Boolean,
    default: false
  },
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
  warehouseType: {
    type: String,
    trim: true
  },
  loadingBay: {
    type: Boolean,
    default: false
  },
  ceilingHeight: {
    type: Number
  },
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
  servicesIncluded: {
    type: String,
    trim: true
  },
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
      'parking', 'garden', 'swimming_pool', 'gym', 'security',
      'elevator', 'balcony', 'furnished', 'air_conditioning',
      'internet', 'water_backup', 'generator',
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
  
  // ✅ UPDATED: Status - automatically calculated based on units
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

// Indexes
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
propertySchema.index({ hasUnits: 1 });
propertySchema.index({ 'units.availability': 1 });

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

// ✅ NEW: Virtual for available units count
propertySchema.virtual('availableUnitsCount').get(function() {
  if (!this.hasUnits || !this.units) return 0;
  return this.units.filter(unit => unit.availability === 'available').length;
});

// ✅ NEW: Virtual for total units count
propertySchema.virtual('totalUnitsCount').get(function() {
  if (!this.hasUnits || !this.units) return 0;
  return this.units.length;
});

// ✅ NEW: Virtual for occupied units count
propertySchema.virtual('occupiedUnitsCount').get(function() {
  if (!this.hasUnits || !this.units) return 0;
  return this.units.filter(unit => unit.availability === 'occupied').length;
});

// Virtual for monthly income
propertySchema.virtual('monthlyIncome').get(function() {
  if (this.hasUnits) {
    return this.units
      .filter(unit => unit.availability === 'occupied')
      .reduce((sum, unit) => sum + (unit.rent || 0), 0);
  }
  return this.availability === 'occupied' ? this.rent : 0;
});

// ✅ NEW: Virtual for potential monthly income
propertySchema.virtual('potentialMonthlyIncome').get(function() {
  if (this.hasUnits) {
    return this.units.reduce((sum, unit) => sum + (unit.rent || 0), 0);
  }
  return this.rent || 0;
});

propertySchema.virtual('isLandType').get(function() {
  return ['land', 'plot', 'farm'].includes(this.propertyType);
});

// ✅ NEW: Pre-save middleware to auto-update availability based on units
propertySchema.pre('save', function(next) {
  // Auto-approve if created by agent or admin
  if (this.isNew) {
    if (this.createdByRole === 'agent' || this.createdByRole === 'admin') {
      this.approved = true;
      this.approvalStatus = 'approved';
      this.approvedBy = this.createdBy;
      this.approvedAt = new Date();
    } else {
      this.approved = false;
      this.approvalStatus = 'pending';
    }
  }
  
  // ✅ Auto-update property availability based on units
  if (this.hasUnits && this.units && this.units.length > 0) {
    const availableUnits = this.units.filter(u => u.availability === 'available').length;
    const maintenanceUnits = this.units.filter(u => u.availability === 'maintenance').length;
    
    if (availableUnits === 0 && maintenanceUnits === 0) {
      this.availability = 'occupied'; // All units occupied
    } else if (maintenanceUnits === this.units.length) {
      this.availability = 'maintenance'; // All units under maintenance
    } else {
      this.availability = 'available'; // At least one unit available
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

// ✅ NEW: Unit management methods
propertySchema.methods.addUnit = function(unitData) {
  this.units.push(unitData);
  return this.save();
};

propertySchema.methods.updateUnit = function(unitId, updateData) {
  const unit = this.units.id(unitId);
  if (!unit) {
    throw new Error('Unit not found');
  }
  Object.assign(unit, updateData);
  return this.save();
};

propertySchema.methods.removeUnit = function(unitId) {
  this.units.pull(unitId);
  return this.save();
};

propertySchema.methods.occupyUnit = async function(unitId, tenantId, leaseStart, leaseEnd) {
  console.log('🔧 occupyUnit called:', { unitId, tenantId });
  
  const unit = this.units.id(unitId);
  
  if (!unit) {
    throw new Error('Unit not found');
  }
  
  if (unit.availability !== 'available') {
    throw new Error(`Unit is not available. Current status: ${unit.availability}`);
  }
  
  // Update unit status
  unit.availability = 'occupied';
  unit.tenant = tenantId;
  unit.leaseStart = leaseStart;
  unit.leaseEnd = leaseEnd;
  unit.lastUpdated = new Date();
  
  console.log('✅ Unit updated:', {
    unitNumber: unit.unitNumber,
    availability: unit.availability,
    tenant: unit.tenant
  });
  
  await this.save();
  
  
  await this.updatePropertyAvailability();
  
  return unit;
};

propertySchema.methods.vacateUnit = async function(unitId) {
  console.log('🔧 vacateUnit called:', { unitId });
  
  const unit = this.units.id(unitId);
  
  if (!unit) {
    throw new Error('Unit not found');
  }
  
  // Clear tenant info
  unit.availability = 'available';
  unit.tenant = null;
  unit.leaseStart = null;
  unit.leaseEnd = null;
  unit.lastUpdated = new Date();
  
  console.log('✅ Unit vacated:', {
    unitNumber: unit.unitNumber,
    availability: unit.availability
  });
  
  await this.save();
  

  await this.updatePropertyAvailability();
  
  return unit;
};

propertySchema.methods.updatePropertyAvailability = async function() {
  console.log('🔧 updatePropertyAvailability called');
  
  if (!this.hasUnits || this.units.length === 0) {
    console.log('ℹ️ Single property, skipping auto-update');
    return; // Single property, don't auto-update
  }
  
  const totalUnits = this.units.length;
  const availableUnits = this.units.filter(u => u.availability === 'available').length;
  const occupiedUnits = this.units.filter(u => u.availability === 'occupied').length;
  
  console.log('📊 Unit stats:', {
    total: totalUnits,
    available: availableUnits,
    occupied: occupiedUnits
  });
  
  if (availableUnits === 0 && occupiedUnits > 0) {
    // All units occupied
    this.availability = 'occupied';
    this.status = 'occupied';
    console.log('✅ Property marked as FULLY OCCUPIED');
  } else if (availableUnits > 0) {
    // At least one unit available
    this.availability = 'available';
    this.status = 'available';
    console.log('✅ Property marked as AVAILABLE');
  }
  
  await this.save();
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


propertySchema.statics.findWithAvailableUnits = function() {
  return this.find({
    hasUnits: true,
    'units.availability': 'available',
    approved: true,
    approvalStatus: 'approved'
  }).sort('-createdAt');
};

propertySchema.statics.findAvailableProperties = async function() {
  return this.find({
    $or: [
      
      { hasUnits: false, availability: 'available' },
   
      { hasUnits: true, 'units.availability': 'available' }
    ],
    approvalStatus: 'approved'
  });
};

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;