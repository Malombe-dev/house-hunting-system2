// server/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

/* 🛡 Security Middlewares */
app.use(helmet());                // Secure HTTP headers
app.use(mongoSanitize());         // Prevent NoSQL injection

/* 🌍 CORS */
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

/* 📈 Rate Limiting */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100
});
app.use('/api/', limiter);

/* 🧾 Body Parsing */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* 📁 Serve Static Files (Uploads) */
app.use('/uploads', express.static('uploads'));

/* 🧪 Development Request Logger */
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

/* 🚦 API Routes */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/tenants', require('./routes/tenants'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/hierarchy', require('./routes/hierarchy'));

/* 💓 Health Check */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

/* 📚 API Docs (Only in Dev) */
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

/* ❌ 404 Handler */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

/* 🛑 Global Error Handler (Last) */
app.use(errorHandler);

module.exports = app;
