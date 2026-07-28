/**
 * ===========================================
 * PROPERTY ROUTES - Property API Endpoints
 * ===========================================
 * This file defines all property-related routes.
 */

const express = require('express');
const router = express.Router();
const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  publishProperty,
  deleteProperty,
  restoreProperty
} = require('../controllers/propertyController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

// ===========================================
// PUBLIC ROUTES (with optional auth)
// ===========================================

/**
 * GET /api/properties
 * Purpose: Get all properties with filtering
 * Access: Public (with optional auth for owners to see drafts)
 */
router.get('/', optionalAuth, getProperties);

/**
 * GET /api/properties/:id
 * Purpose: Get a single property by ID
 * Access: Public (with optional auth)
 */
router.get('/:id', optionalAuth, getProperty);

// ===========================================
// PROTECTED ROUTES (Authentication Required)
// ===========================================

/**
 * POST /api/properties
 * Purpose: Create a new property with image upload
 * Access: Private (Owner or Admin only)
 */
router.post(
  '/',
  protect,
  authorize('owner', 'admin'),
  upload.array('images', 10),
  createProperty
);

/**
 * PUT /api/properties/:id
 * Purpose: Update a property with image upload (draft only)
 * Access: Private (Owner or Admin)
 */
router.put(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  upload.array('images', 10),
  updateProperty
);

/**
 * POST /api/properties/:id/publish
 * Purpose: Publish a property (draft only)
 * Access: Private (Owner or Admin)
 */
router.post('/:id/publish', protect, authorize('owner', 'admin'), publishProperty);

/**
 * DELETE /api/properties/:id
 * Purpose: Soft delete a property
 * Access: Private (Owner or Admin)
 */
router.delete('/:id', protect, authorize('owner', 'admin'), deleteProperty);

/**
 * POST /api/properties/:id/restore
 * Purpose: Restore a soft-deleted property
 * Access: Private (Admin only)
 */
router.post('/:id/restore', protect, authorize('admin'), restoreProperty);

// ===========================================
// MULTER ERROR HANDLER
// ===========================================
router.use(handleMulterError);

module.exports = router;