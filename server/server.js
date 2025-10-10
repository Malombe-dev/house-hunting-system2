const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// 🧩 Import DB connection
const connectDB = require('./src/config/database');

// 🧩 Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const propertyRoutes = require('./src/routes/properties');
const tenantRoutes = require('./src/routes/tenants');
const paymentRoutes = require('./src/routes/payments');
const maintenanceRoutes = require('./src/routes/maintenance');
const reviewRoutes = require('./src/routes/reviews');
const analyticsRoutes = require('./src/routes/analytics');
const hierarchyRoutes = require('./src/routes/hierarchy');

// 🧩 Import middleware
const errorHandler = require('./src/middleware/errorHandler');

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(compression());

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

// ✅ Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/hierarchy', hierarchyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

// ✅ Connect to DB and then start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
