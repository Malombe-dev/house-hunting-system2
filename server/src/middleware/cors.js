// server/src/middleware/cors.js
const cors = require('cors');

// Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL
].filter(Boolean); // Remove undefined values

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

// Simple CORS middleware (for development)
const simpleCors = cors({
  origin: '*',
  credentials: true
});

// Secure CORS middleware (for production)
const secureCors = cors(corsOptions);

// Export based on environment
module.exports = process.env.NODE_ENV === 'production' ? secureCors : simpleCors;

// Export both for manual use
module.exports.simpleCors = simpleCors;
module.exports.secureCors = secureCors;
module.exports.corsOptions = corsOptions;