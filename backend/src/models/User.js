/**
 * ===========================================
 * USER MODEL - MongoDB Schema for Users
 * ===========================================
 * This file defines the User schema and all related methods.
 * It handles password hashing, validation, and comparison.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ===========================================
// 1. USER SCHEMA DEFINITION
// ===========================================

/**
 * User Schema - Defines the structure of user documents in MongoDB
 * 
 * Fields:
 * - name: User's full name (required, trimmed)
 * - email: User's email address (required, unique, lowercase)
 * - password: User's password (required, min 6 chars, not selected by default)
 * - role: User's role (admin, owner, or user) - defaults to 'user'
 * - favorites: Array of Property IDs the user has favorited
 * 
 * Options:
 * - timestamps: Automatically adds createdAt and updatedAt fields
 */
const UserSchema = new mongoose.Schema({
  // User's full name
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true // Removes whitespace from both ends
  },
  
  // User's email address
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true, // No two users can have the same email
    lowercase: true // Automatically converts to lowercase
  },
  
  // User's password
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6, // Password must be at least 6 characters
    select: false // Excludes password from query results by default
  },
  
  // User's role (determines permissions)
  role: {
    type: String,
    enum: ['admin', 'owner', 'user'], // Only these values are allowed
    default: 'user' // Default role for new users
  },
  
  // Array of property IDs the user has favorited
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property' // References the Property model
  }]
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// ===========================================
// 2. PRE-SAVE HOOK - Password Hashing
// ===========================================

/**
 * Mongoose Middleware - Executes before saving a user document
 * Purpose: Hashes the password before storing it in the database
 * 
 * Note: For Mongoose 9.x, async middleware does NOT need to call next()
 * The function should return a promise or be async
 * 
 * Flow:
 * 1. Check if password field is modified
 * 2. If not modified, skip hashing
 * 3. If modified, generate salt and hash the password
 * 4. Replace plain password with hashed password
 */
UserSchema.pre('save', async function() {
  console.log('🔐 Pre-save hook triggered');
  
  // Check if password is modified
  if (!this.isModified('password')) {
    console.log('Password not modified, skipping hash');
    return; // No need to hash if password hasn't changed
  }
  
  // Hash the password
  console.log('Hashing password...');
  const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
  this.password = await bcrypt.hash(this.password, salt); // Hash password
  console.log('Password hashed successfully');
});

// ===========================================
// 3. COMPARE PASSWORD METHOD
// ===========================================

/**
 * Instance Method - Compares a plain text password with the stored hashed password
 * Purpose: Used during login to verify credentials
 * 
 * @param {string} candidatePassword - The plain text password provided by user
 * @returns {Promise<boolean>} - Returns true if passwords match, false otherwise
 * 
 * Flow:
 * 1. Use bcrypt.compare to compare passwords
 * 2. Returns boolean (true if match, false if not)
 * 3. Handles errors gracefully
 */
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('🔍 Comparing passwords...');
    console.log('Candidate:', candidatePassword);
    console.log('Stored (hashed):', this.password);
    
    // Compare plain text with hashed password
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Match result:', isMatch);
    
    return isMatch;
  } catch (error) {
    console.error('Compare error:', error);
    return false; // Return false on error
  }
};

// ===========================================
// 4. EXPORT MODEL
// ===========================================

/**
 * Create and export the User model
 * The model is used to interact with the 'users' collection in MongoDB
 * 
 * Usage:
 * const User = require('../models/User');
 * const user = await User.findOne({ email: 'john@example.com' });
 * const newUser = await User.create({ name, email, password });
 */
module.exports = mongoose.model('User', UserSchema);