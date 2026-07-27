/**
 * ===========================================
 * AUTH MIDDLEWARE - JWT Verification
 * ===========================================
 * This middleware protects routes by verifying JWT tokens.
 * It extracts the token from the Authorization header,
 * verifies it, and attaches the user to the request object.
 */

const jwt = require('jsonwebtoken'); // For verifying JWT tokens
const User = require('../models/User'); // User model for database operations

// ===========================================
// PROTECT MIDDLEWARE - Verify JWT Token
// ===========================================

/**
 * Purpose: Protect routes by requiring a valid JWT token
 * Usage: Place this middleware on routes that need authentication
 * 
 * Example:
 * router.get('/me', protect, getMe);
 * 
 * Flow:
 * 1. Extract token from Authorization header
 * 2. If no token → return 401 error
 * 3. Verify token using JWT_SECRET
 * 4. Find user by ID from decoded token (exclude password)
 * 5. If user not found → return 401 error
 * 6. Attach user to req.user
 * 7. Call next() to proceed to controller
 * 
 * Headers Required:
 * Authorization: Bearer <jwt_token>
 * 
 * Response on Success:
 * - Calls next() -> proceeds to controller
 * - req.user contains the authenticated user object
 * 
 * Response on Failure:
 * {
 *   success: false,
 *   message: "Not authorized, no token" | "Not authorized, user not found" | "Not authorized, invalid token"
 * }
 */
const protect = async (req, res, next) => {
  try {
    // =========================================
    // STEP 1: Extract Token from Header
    // =========================================
    let token;
    
    // Check if Authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token (remove 'Bearer ' prefix)
      token = req.headers.authorization.split(' ')[1];
    }
    
    // =========================================
    // STEP 2: Check if Token Exists
    // =========================================
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }
    
    // =========================================
    // STEP 3: Verify Token
    // =========================================
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: 'user_id', iat: 1234567890, exp: 1234567890 }
    
    // =========================================
    // STEP 4: Find User by ID
    // =========================================
    req.user = await User.findById(decoded.id).select('-password');
    // Exclude password field for security
    
    // =========================================
    // STEP 5: Check if User Exists
    // =========================================
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });
    }
    
    // =========================================
    // STEP 6: Proceed to Controller
    // =========================================
    // User is authenticated, attach user to request and continue
    next();
    
  } catch (error) {
    // =========================================
    // ERROR HANDLING - Invalid Token
    // =========================================
    // Catches errors like:
    // - Token expired
    // - Token tampered
    // - Invalid signature
    console.error('Auth error:', error.message);
    
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid token'
    });
  }
};

// ===========================================
// AUTHORIZE MIDDLEWARE - Role-Based Access Control
// ===========================================

/**
 * Purpose: Restrict access based on user roles
 * Usage: Place this middleware after protect
 * 
 * Example:
 * router.post('/admin-only', protect, authorize('admin'), adminController);
 * 
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'owner', 'user')
 * @returns {Function} Middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists on request (should be set by protect)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if user's role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`
      });
    }

    // User has permission, proceed
    next();
  };
};
// ===========================================
// OPTIONAL AUTH - Try to authenticate but don't require it
// ===========================================
/**
 * Purpose: Optional authentication - attaches user if token is valid, but doesn't require it
 * Usage: For routes that work for both authenticated and unauthenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        console.log('🔓 Optional Auth - User found:', req.user ? req.user.email : 'Not found');
      } catch (error) {
        // Token is invalid, but we don't care - just continue as unauthenticated
        console.log('🔓 Optional Auth - Invalid token, continuing as public');
        req.user = null;
      }
    } else {
      console.log('🔓 Optional Auth - No token, continuing as public');
      req.user = null;
    }
    
    next();
  } catch (error) {
    // If anything goes wrong, just continue as unauthenticated
    req.user = null;
    next();
  }
};

// ===========================================
// EXPORT MIDDLEWARE
// ===========================================

module.exports = {
  protect,    // For verifying JWT tokens
  authorize,   // For role-based access control
  optionalAuth // For optional authentication
};