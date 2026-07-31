/**
 * ===========================================
 * AUTH CONTROLLER - Authentication Logic
 * ===========================================
 * This file handles all authentication business logic.
 * It processes requests, interacts with the database,
 * and returns appropriate responses.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ===========================================
// 1. GENERATE JWT TOKEN
// ===========================================

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ===========================================
// 2. REGISTER - Create New User (NO TOKEN)
// ===========================================

const register = async (req, res) => {
  try {
    console.log('✅ Register endpoint hit!');
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    // ✅ Return SAME response for ALL roles - NO token
    res.status(201).json({
      success: true,
      message: 'User created successfully',
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

const login = async (req, res) => {
  try {
    console.log('✅ Login endpoint hit!');
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

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

const getMe = async (req, res) => {
  try {
    console.log('✅ GetMe endpoint hit!');
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