/**
 * ===========================================
 * SERVER.JS - MAIN APPLICATION FILE
 * ===========================================
 * This is the entry point of the backend application.
 * It sets up the Express server, connects to MongoDB,
 * and defines all API routes.
 */

// ===========================================
// 1. IMPORT DEPENDENCIES
// ===========================================

const express = require('express');      // Web framework for building APIs
const mongoose = require('mongoose');    // MongoDB connection and data modeling
const cors = require('cors');            // Allows frontend to access this backend
const dotenv = require('dotenv');        // Loads environment variables from .env file

// ===========================================
// 2. LOAD ENVIRONMENT VARIABLES
// ===========================================

dotenv.config(); // Reads .env file and loads variables into process.env

// ===========================================
// 3. CREATE EXPRESS APP
// ===========================================

const app = express(); // Initialize the Express application

// ===========================================
// 4. MIDDLEWARE SETUP
// ===========================================

// CORS - Allows requests from different domains (frontend)
app.use(cors());

// JSON Parser - Automatically parses JSON data from incoming requests
app.use(express.json());

// ===========================================
// 5. MONGODB CONNECTION
// ===========================================

// Connect to MongoDB Atlas using the connection string from .env
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    // Success: Connection established
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
  })
  .catch((err) => {
    // Error: Connection failed
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1); // Stop the server if database connection fails
  });

// ===========================================
// 6. HEALTH CHECK ROUTE
// ===========================================

/**
 * GET /api/health
 * Purpose: Check if the server is running
 * Use: Deployment verification, monitoring
 * Response: Server status, timestamp, database connection status
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Server is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'
  });
});

// ===========================================
// 7. AUTHENTICATION ROUTES
// ===========================================

/**
 * All authentication routes are defined in authRoutes.js
 * They are mounted under /api/auth prefix
 * 
 * Available Routes:
 * POST   /api/auth/register  - Create new user
 * POST   /api/auth/login     - Login and get JWT token
 * GET    /api/auth/me        - Get current user profile (protected)
 * POST   /api/auth/logout    - Logout user (protected)
 */

// Import authentication routes
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes); // Mount routes under /api/auth

/**
 * GET /api/auth/test
 * Purpose: Quick test to verify auth routes are working
 */
app.get('/api/auth/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString()
  });
});

// ===========================================
// 8. PROPERTY ROUTES
// ===========================================

/**
 * All property routes are defined in propertyRoutes.js
 * They are mounted under /api/properties prefix
 * 
 * Available Routes:
 * GET    /api/properties           - Get all properties (public)
 * GET    /api/properties/:id       - Get single property (public)
 * POST   /api/properties           - Create property (owner/admin)
 * PUT    /api/properties/:id       - Update property (owner/admin)
 * POST   /api/properties/:id/publish  - Publish property (owner/admin)
 * DELETE /api/properties/:id       - Soft delete property (owner/admin)
 * POST   /api/properties/:id/restore  - Restore property (admin only)
 */

// Import property routes
const propertyRoutes = require('./src/routes/propertyRoutes');
app.use('/api/properties', propertyRoutes); // Mount routes under /api/properties

// ===========================================
// 9. 404 HANDLER - Route Not Found
// ===========================================

/**
 * This middleware catches all requests that don't match any defined routes
 * It returns a 404 error with a clear message
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// ===========================================
// 10. ERROR HANDLER - Catch All Errors
// ===========================================

/**
 * This middleware catches any errors thrown in the application
 * It prevents the server from crashing and returns a proper error response
 * 
 * Error types it handles:
 * - MongoDB errors (duplicate key, validation)
 * - JWT errors (invalid token, expired)
 * - Custom errors from controllers
 * - Any other unhandled errors
 */
app.use((err, req, res, next) => {
  // Log the error for debugging
  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);

  // Determine the status code
  const statusCode = err.statusCode || 500;

  // Send error response to client
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// ===========================================
// 11. START THE SERVER
// ===========================================

const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

app.listen(PORT, () => {
  console.log('====================================');
  console.log('🚀 Server Started Successfully');
  console.log('====================================');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`🏠 Properties: http://localhost:${PORT}/api/properties`);
  console.log('====================================');
});

// ===========================================
// 12. GRACEFUL SHUTDOWN
// ===========================================

/**
 * When the server is stopped (Ctrl+C or SIGTERM),
 * this closes the database connection properly
 * Prevents connection leaks
 */
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

// ===========================================
// EXPORT APP FOR TESTING
// ===========================================

module.exports = app; // Allows testing with Supertest or Jest