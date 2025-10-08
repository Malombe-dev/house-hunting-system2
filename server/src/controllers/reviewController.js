// server/src/controllers/reviewController.js
const Review = require('../models/Review');
const Property = require('../models/Property');

// Create review
exports.createReview = async (req, res) => {
  try {
    const { property, rating, comment, images } = req.body;

    // Check if property exists
    const propertyExists = await Property.findById(property);
    if (!propertyExists) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user already reviewed this property
    const existingReview = await Review.findOne({
      property,
      reviewedBy: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this property' });
    }

    const review = new Review({
      property,
      reviewedBy: req.user.id,
      rating,
      comment,
      images: images || []
    });

    await review.save();

    // Update property rating
    await updatePropertyRating(property);

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const { property, rating, status, page = 1, limit = 10 } = req.query;

    const query = {};
    
    if (property) query.property = property;
    if (rating) query.rating = rating;
    if (status) query.status = status;

    const reviews = await Review.find(query)
      .populate('property', 'name address images')
      .populate('reviewedBy', 'firstName lastName avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Review.countDocuments(query);

    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get review by ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('property', 'name address images rent')
      .populate('reviewedBy', 'firstName lastName email avatar');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get reviews by property
exports.getReviewsByProperty = async (req, res) => {
  try {
    const { page = 1, limit = 10, rating } = req.query;
    const query = { property: req.params.propertyId, status: 'approved' };
    
    if (rating) query.rating = rating;

    const reviews = await Review.find(query)
      .populate('reviewedBy', 'firstName lastName avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Review.countDocuments(query);

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { property: req.params.propertyId, status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const avgRating = await Review.aggregate([
      { $match: { property: req.params.propertyId, status: 'approved' } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          total: { $sum: 1 }
        }
      }
    ]);

    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
      ratingDistribution,
      averageRating: avgRating[0]?.average || 0,
      totalReviews: avgRating[0]?.total || 0
    });
  } catch (error) {
    console.error('Get property reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment, images } = req.body;

    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.reviewedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    await review.save();

    // Update property rating
    await updatePropertyRating(review.property);

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review or is admin
    if (review.reviewedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const propertyId = review.property;
    await review.deleteOne();

    // Update property rating
    await updatePropertyRating(propertyId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve/Reject review (Admin only)
exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.status = status;
    await review.save();

    // Update property rating if approved
    if (status === 'approved') {
      await updatePropertyRating(review.property);
    }

    res.json({
      message: `Review ${status} successfully`,
      review
    });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to update property rating
async function updatePropertyRating(propertyId) {
  const result = await Review.aggregate([
    { 
      $match: { 
        property: propertyId,
        status: 'approved'
      } 
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    await Property.findByIdAndUpdate(propertyId, {
      rating: result[0].averageRating,
      reviewCount: result[0].totalReviews
    });
  } else {
    await Property.findByIdAndUpdate(propertyId, {
      rating: 0,
      reviewCount: 0
    });
  }
}