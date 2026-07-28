/**
 * ===========================================
 * FAVORITE CONTROLLER - Manage User Favorites
 * ===========================================
 * This file handles adding, removing, and getting favorite properties.
 */

const User = require('../models/User');
const Property = require('../models/Properties');

// ===========================================
// 1. ADD TO FAVORITES
// ===========================================
/**
 * POST /api/favorites/:propertyId
 * Purpose: Add a property to user's favorites
 * Access: Private (User only)
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Property added to favorites",
 *   data: { favorites: [...] }
 * }
 */
const addToFavorites = async (req, res, next) => {
  try {
    const propertyId = req.params.propertyId;
    const userId = req.user.id;

    // Check if property exists and is published
    const property = await Property.findOne({
      _id: propertyId,
      status: 'published',
      deletedAt: null
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found or not published'
      });
    }

    // Check if already in favorites
    const user = await User.findById(userId);
    if (user.favorites.includes(propertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Property already in favorites'
      });
    }

    // Add to favorites
    user.favorites.push(propertyId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Property added to favorites',
      data: {
        favorites: user.favorites
      }
    });
  } catch (error) {
    next(error);
  }
};

// ===========================================
// 2. REMOVE FROM FAVORITES
// ===========================================
/**
 * DELETE /api/favorites/:propertyId
 * Purpose: Remove a property from user's favorites
 * Access: Private (User only)
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Property removed from favorites",
 *   data: { favorites: [...] }
 * }
 */
const removeFromFavorites = async (req, res, next) => {
  try {
    const propertyId = req.params.propertyId;
    const userId = req.user.id;

    // Remove from favorites array
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: propertyId } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Property removed from favorites',
      data: {
        favorites: user.favorites
      }
    });
  } catch (error) {
    next(error);
  }
};

// ===========================================
// 3. GET USER FAVORITES
// ===========================================
/**
 * GET /api/favorites
 * Purpose: Get all favorite properties for the current user
 * Access: Private (User only)
 * 
 * Response:
 * {
 *   success: true,
 *   count: 2,
 *   data: [ Property, Property, ... ]
 * }
 */
const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user with populated favorites
    const user = await User.findById(userId)
      .populate({
        path: 'favorites',
        populate: {
          path: 'owner',
          select: 'name email'
        },
        match: { deletedAt: null } // Only show non-deleted properties
      });

    // Filter out any null favorites (deleted properties)
    const favorites = user.favorites.filter(fav => fav !== null);

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites
    });
  } catch (error) {
    next(error);
  }
};

// ===========================================
// 4. CHECK IF PROPERTY IS FAVORITED
// ===========================================
/**
 * GET /api/favorites/check/:propertyId
 * Purpose: Check if a property is in user's favorites
 * Access: Private (User only)
 * 
 * Response:
 * {
 *   success: true,
 *   isFavorited: true/false
 * }
 */
const checkFavorite = async (req, res, next) => {
  try {
    const propertyId = req.params.propertyId;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const isFavorited = user.favorites.includes(propertyId);

    res.status(200).json({
      success: true,
      isFavorited
    });
  } catch (error) {
    next(error);
  }
};

// ===========================================
// EXPORT CONTROLLER FUNCTIONS
// ===========================================

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite
};