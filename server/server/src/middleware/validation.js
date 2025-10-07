const { validationResult } = require('express-validator');

// Check validation results
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

// Custom validators
exports.isValidObjectId = (value) => {
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid ID format');
  }
  return true;
};

exports.isValidPhone = (value) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(value)) {
    throw new Error('Invalid phone number format');
  }
  return true;
};

exports.isValidEmail = (value) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(value)) {
    throw new Error('Invalid email format');
  }
  return true;
};

exports.isStrongPassword = (value) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
  if (value.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  if (!passwordRegex.test(value)) {
    throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }
  return true;
};