// server/src/models/User.js (UPDATED WITH HIERARCHY)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'agent', 'landlord', 'employee', 'tenant', 'seeker'],
    default: 'seeker'
  },
  avatar: {
    type: String,
    default: null
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  
  // HIERARCHY FIELDS
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  parentUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  mustChangePassword: {
    type: Boolean,
    default: true
  },
  
  // For Agents/Landlords
  businessName: String,
  businessLicense: String,
  
  // For Employees
  jobTitle: String,
  branch: String,
  employeeId: String,
  permissions: {
    canCreateTenants: { type: Boolean, default: false },
    canViewReports: { type: Boolean, default: false },
    canManageProperties: { type: Boolean, default: false },
    canHandlePayments: { type: Boolean, default: false }
  },
  
  // Additional profile fields
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Kenya' }
  },
  idNumber: String,
  dateOfBirth: Date,
  
  // For tenants
  occupation: String,
  employer: {
    name: String,
    phone: String,
    address: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ parentUser: 1 });
userSchema.index({ createdBy: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

// Check if user has permission
userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'admin') return true;
  if (this.role === 'agent' || this.role === 'landlord') return true;
  if (this.role === 'employee') {
    return this.permissions && this.permissions[permission];
  }
  return false;
};

// Get user hierarchy level
userSchema.methods.getHierarchyLevel = function() {
  if (this.role === 'admin') return 1;
  if (this.role === 'agent' || this.role === 'landlord') return 2;
  if (this.role === 'employee') return 3;
  if (this.role === 'tenant') return 4;
  if (this.role === 'seeker') return 5;
  return 6;
};
// In your User model - add logging to comparePassword
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('🔑 COMPARE PASSWORD METHOD =================');
    console.log('   Candidate password:', candidatePassword);
    console.log('   Stored hash:', this.password);
    console.log('   Hash starts with:', this.password.substring(0, 10) + '...');
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('   Comparison result:', isMatch);
    console.log('========================================\n');
    
    return isMatch;
  } catch (error) {
    console.error('💥 Password comparison error:', error);
    throw new Error('Password comparison failed');
  }
};

// Get user without sensitive data
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.verificationToken;
  delete user.verificationTokenExpires;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;