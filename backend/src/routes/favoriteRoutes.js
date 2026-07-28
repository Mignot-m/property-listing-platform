/**
 * ===========================================
 * FAVORITE ROUTES - Favorite API Endpoints
 * ===========================================
 * This file defines all favorite-related routes.
 */

const express = require('express');
const router = express.Router();
const {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

/**
 * GET /api/favorites
 * Purpose: Get all favorite properties for current user
 * Access: Private (User only)
 */
router.get('/', getFavorites);

/**
 * GET /api/favorites/check/:propertyId
 * Purpose: Check if a property is favorited
 * Access: Private (User only)
 */
router.get('/check/:propertyId', checkFavorite);

/**
 * POST /api/favorites/:propertyId
 * Purpose: Add a property to favorites
 * Access: Private (User only)
 */
router.post('/:propertyId', addToFavorites);

/**
 * DELETE /api/favorites/:propertyId
 * Purpose: Remove a property from favorites
 * Access: Private (User only)
 */
router.delete('/:propertyId', removeFromFavorites);

module.exports = router;