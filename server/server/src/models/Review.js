const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    default: null
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  reviewType: {
    type: String,
    enum: ['property', 'agent', 'tenant'],
    required: true
  },
  // Detailed ratings for properties
  detailedRatings: {
    location: Number,
    value: Number,
    cleanliness: Number,
    communication: Number,
    amenities: Number
  },
  verified: {
    type: Boolean,
    default: false
  },
  response: {
    comment: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  helpful: {
    type: Number,
    default: 0
  },
  reported: {
    type: Boolean,
    default: false
  },
  reportReason: String
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ property: 1 });
reviewSchema.index({ agent: 1 });
reviewSchema.index({ tenant: 1 });
reviewSchema.index({ reviewedBy: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });

// Ensure one review per user per property/agent/tenant
reviewSchema.index({ property: 1, reviewedBy: 1 }, { unique: true, sparse: true });
reviewSchema.index({ agent: 1, reviewedBy: 1 }, { unique: true, sparse: true });
reviewSchema.index({ tenant: 1, reviewedBy: 1 }, { unique: true, sparse: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;