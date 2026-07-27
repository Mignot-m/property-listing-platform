/**
 * ===========================================
 * AUTH ROUTES - Authentication Endpoints
 * ===========================================
 * This file defines all authentication-related API routes.
 * Routes are divided into public (no token needed) and protected (token required).
 */

const express = require('express');
const router = express.Router();

// Import controller functions
const { register, login, getMe, logout } = require('../controllers/authController');

// Import authentication middleware
const { protect } = require('../middleware/auth');

// ===========================================
// PUBLIC ROUTES - No authentication required
// ===========================================

/**
 * POST /register
 * Purpose: Create a new user account
 * Access: Public (anyone can register)
 * Request Body: { name, email, password, role }
 * Response: { success, token, user data }
 */
router.post('/register', register);

/**
 * POST /login
 * Purpose: Authenticate user and get JWT token
 * Access: Public (anyone can login)
 * Request Body: { email, password }
 * Response: { success, token, user data }
 */
router.post('/login', login);

// ===========================================
// PROTECTED ROUTES - Authentication required
// ===========================================

/**
 * GET /me
 * Purpose: Get current logged-in user's profile
 * Access: Private (valid JWT token required)
 * Headers: Authorization: Bearer <token>
 * Response: { success, user data }
 */
router.get('/me', protect, getMe);

/**
 * POST /logout
 * Purpose: Logout user (client-side token removal)
 * Access: Private (valid JWT token required)
 * Headers: Authorization: Bearer <token>
 * Response: { success, message }
 */
router.post('/logout', protect, logout);

// ===========================================
// TEST ROUTE - For development verification
// ===========================================

/**
 * GET /test
 * Purpose: Quick test to verify auth routes are mounted
 * Access: Public (no authentication needed)
 * Response: { success, message }
 * Use: Development debugging only
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth route is working!',
    timestamp: new Date().toISOString()
  });
});

// ===========================================
// EXPORT ROUTER
// ===========================================

module.exports = router;