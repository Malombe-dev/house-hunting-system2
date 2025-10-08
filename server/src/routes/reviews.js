// server/src/routes/reviews.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const {protect: authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');
const { uploadMultiple } = require('../middleware/upload');


// @route   GET /api/reviews
// @desc    Get all reviews
// @access  Public
router.get('/', reviewController.getAllReviews);

// @route   GET /api/reviews/property/:propertyId
// @desc    Get reviews by property
// @access  Public
router.get('/property/:propertyId', reviewController.getReviewsByProperty);

// @route   GET /api/reviews/:id
// @desc    Get review by ID
// @access  Public
router.get('/:id', reviewController.getReviewById);

// @route   POST /api/reviews
// @desc    Create review
// @access  Private
router.post('/', authenticateToken, uploadMultiple('images', 5), reviewController.createReview);

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private
router.put('/:id', authenticateToken, uploadMultiple('images', 5), reviewController.updateReview);

// @route   PUT /api/reviews/:id/status
// @desc    Update review status (Approve/Reject)
// @access  Private/Admin
router.put('/:id/status', authenticateToken, authorizeRoles('admin'), reviewController.updateReviewStatus);

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', authenticateToken, reviewController.deleteReview);

module.exports = router;