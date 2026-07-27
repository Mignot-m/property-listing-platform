/**
 * ===========================================
 * AUTH CONTROLLER - Authentication Logic
 * ===========================================
 * This file handles all authentication business logic.
 * It processes requests, interacts with the database,
 * and returns appropriate responses.
 */

const jwt = require('jsonwebtoken'); // For generating JWT tokens
const User = require('../models/User'); // User model for database operations

// ===========================================
// 1. GENERATE JWT TOKEN
// ===========================================

/**
 * Generates a JSON Web Token for authenticated users
 * @param {string} id - User ID
 * @returns {string} JWT token valid for 7 days
 */
const generateToken = (id) => {
  return jwt.sign(
    { id }, // Payload - user ID
    process.env.JWT_SECRET, // Secret key from .env
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// ===========================================
// 2. REGISTER - Create New User
// ===========================================

/**
 * POST /api/auth/register
 * Purpose: Register a new user account
 * 
 * Request Body:
 * {
 *   name: "John Doe",
 *   email: "john@example.com",
 *   password: "password123",
 *   role: "user" // optional, defaults to "user"
 * }
 * 
 * Flow:
 * 1. Check if user already exists (by email)
 * 2. If exists → return error
 * 3. If not → create new user (password auto-hashed by model)
 * 4. Generate JWT token
 * 5. Return token and user data
 * 
 * Response:
 * {
 *   success: true,
 *   token: "eyJhbGciOiJIUzI1NiIs...",
 *   data: { id, name, email, role }
 * }
 */
const register = async (req, res) => {
  try {
    console.log('✅ Register endpoint hit!');
    const { name, email, password, role } = req.body;

    // Step 1: Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Step 2: Create new user
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by pre-save hook in User model
      role: role || 'user' // Default role is 'user'
    });

    // Step 3: Generate JWT token
    const token = generateToken(user._id);

    // Step 4: Return success response
    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===========================================
// 3. LOGIN - Authenticate User
// ===========================================

/**
 * POST /api/auth/login
 * Purpose: Authenticate user and return JWT token
 * 
 * Request Body:
 * {
 *   email: "john@example.com",
 *   password: "password123"
 * }
 * 
 * Flow:
 * 1. Validate email and password are provided
 * 2. Find user by email (include password field)
 * 3. If user not found → return error
 * 4. Compare provided password with stored hashed password
 * 5. If mismatch → return error
 * 6. Generate JWT token
 * 7. Return token and user data
 * 
 * Response:
 * {
 *   success: true,
 *   token: "eyJhbGciOiJIUzI1NiIs...",
 *   data: { id, name, email, role }
 * }
 */
const login = async (req, res) => {
  try {
    console.log('✅ Login endpoint hit!');
    const { email, password } = req.body;

    // Step 1: Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Step 2: Find user by email (include password field)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Step 3: Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Step 4: Generate token
    const token = generateToken(user._id);

    // Step 5: Return success response
    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===========================================
// 4. GET ME - Get Current User Profile
// ===========================================

/**
 * GET /api/auth/me
 * Purpose: Get current logged-in user's profile
 * 
 * Headers:
 * Authorization: Bearer <jwt_token>
 * 
 * Flow:
 * 1. User ID is attached to req.user by protect middleware
 * 2. Find user by ID (exclude password field)
 * 3. Return user data
 * 
 * Response:
 * {
 *   success: true,
 *   data: { id, name, email, role, favorites, createdAt, updatedAt }
 * }
 */
const getMe = async (req, res) => {
  try {
    console.log('✅ GetMe endpoint hit!');
    
    // Find user by ID (attached by protect middleware)
    const user = await User.findById(req.user.id).select('-password');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ===========================================
// 5. LOGOUT - Logout User
// ===========================================

/**
 * POST /api/auth/logout
 * Purpose: Logout user (client-side token removal)
 * 
 * Headers:
 * Authorization: Bearer <jwt_token>
 * 
 * Note: Actual logout happens on client-side by removing the token.
 * This endpoint simply returns a success message.
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Logged out successfully"
 * }
 */
const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// ===========================================
// EXPORT CONTROLLER FUNCTIONS
// ===========================================

module.exports = {
  register,
  login,
  getMe,
  logout
};