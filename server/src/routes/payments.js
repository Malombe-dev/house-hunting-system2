// server/src/routes/payments.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect: authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');

// @route   GET /api/payments
// @desc    Get all payments
// @access  Private
router.get('/', authenticateToken, paymentController.getAllPayments);

// @route   GET /api/payments/stats
// @desc    Get payment statistics
// @access  Private/Agent/Admin
router.get('/stats', authenticateToken, authorizeRoles('agent', 'admin'), paymentController.getPaymentStats);

// @route   GET /api/payments/monthly-revenue
// @desc    Get monthly revenue
// @access  Private/Agent/Admin
router.get('/monthly-revenue', authenticateToken, authorizeRoles('agent', 'admin'), paymentController.getMonthlyRevenue);

// @route   GET /api/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', authenticateToken, paymentController.getPaymentById);

// @route   POST /api/payments
// @desc    Create payment record
// @access  Private/Agent/Admin
router.post('/', authenticateToken, authorizeRoles('agent', 'admin'), paymentController.createPayment);

// @route   PUT /api/payments/:id
// @desc    Update payment
// @access  Private/Agent/Admin
router.put('/:id', authenticateToken, authorizeRoles('agent', 'admin'), paymentController.updatePayment);

// @route   DELETE /api/payments/:id
// @desc    Delete payment
// @access  Private/Admin
router.delete('/:id', authenticateToken, authorizeRoles('admin'), paymentController.deletePayment);

module.exports = router;