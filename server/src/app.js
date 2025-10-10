// server/src/app.js
const express = require('express');
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS middleware
app.use(corsMiddleware);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/tenants', require('./routes/tenants'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/hierarchy', require('./routes/hierarchy')); // NEW

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API documentation (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/api', (req, res) => {
    res.json({
      message: 'House Hunting API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        properties: '/api/properties',
        tenants: '/api/tenants',
        payments: '/api/payments',
        maintenance: '/api/maintenance',
        reviews: '/api/reviews',
        analytics: '/api/analytics',
        hierarchy: '/api/hierarchy'
      }
    });
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/tenants', require('./routes/tenants'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API documentation (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/api', (req, res) => {
    res.json({
      message: 'House Hunting API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        properties: '/api/properties',
        tenants: '/api/tenants',
        payments: '/api/payments',
        maintenance: '/api/maintenance',
        reviews: '/api/reviews',
        analytics: '/api/analytics'
      }
    });
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;