/**
 * ===========================================
 * PROPERTY CONTROLLER - Property CRUD Operations
 * ===========================================
 * This file handles all property-related business logic.
 */

const Property = require('../models/Properties');
const { AppError } = require('../middleware/errorHandler');

// ===========================================
// 1. CREATE PROPERTY
// ===========================================
/**
 * POST /api/properties
 * Purpose: Create a new property (Owner or Admin only)
 * Access: Private (owner, admin)
 * 
 * Request Body:
 * {
 *   title: "Beautiful Villa",
 *   description: "A beautiful villa with pool",
 *   location: "Addis Ababa, Ethiopia",
 *   price: 5000000,
 *   images: ["https://example.com/image1.jpg"],
 *   status: "draft" // optional, defaults to draft
 * }
 */
const createProperty = async (req, res, next) => {
  try {
    // Only owners and admins can create properties
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only property owners can create properties'
      });
    }

    const propertyData = {
      ...req.body,
      owner: req.user.id
    };

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property
    });
  } catch (error) {
    next(error);
  }
};

// ===========================================
// 2. GET ALL PROPERTIES
// ===========================================
/**
 * GET /api/properties
 * Purpose: Get all properties with pagination and filtering
 * Access: Public (all roles)
 * 
 * Query Parameters:
 * - page: 1 (default)
 * - limit: 10 (default)
 * - location: "Addis Ababa"
 * - minPrice: 100000
 * - maxPrice: 1000000
 * - status: "published" (user sees only published, admin sees all)
 */
// ===========================================
// 2. GET ALL PROPERTIES
// ===========================================
/**
 * GET /api/properties
 * Purpose: Get all properties with pagination and filtering
 * Access: Public (all roles)
 * 
 * Query Parameters:
 * - page: 1 (default)
 * - limit: 10 (default)
 * - location: "Addis Ababa"
 * - minPrice: 100000
 * - maxPrice: 1000000
 * - status: "published" (user sees only published, admin sees all)
 */
const getProperties = async (req, res, next) => {
  try {
    console.log('====================================');
    console.log('🔍 GET PROPERTIES DEBUG');
    console.log('====================================');
    console.log('📌 User:', req.user ? {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    } : 'No user (public)');

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { deletedAt: null };

    // Get user role from request (if authenticated)
    const userRole = req.user ? req.user.role : null;
    const userId = req.user ? req.user.id : null;

    console.log('📌 User role:', userRole);
    console.log('📌 User ID:', userId);

    // If user is NOT authenticated OR is regular user
    if (!req.user || userRole === 'user') {
      filter.status = 'published';
      console.log('🔒 Public or regular user, showing only published');
    } 
    // If user is owner, show ALL their own properties (draft, published, archived)
    else if (userRole === 'owner') {
      filter.owner = userId;
      console.log('👤 Owner, showing all own properties');
    }
    // If user is admin, show everything (no filter)
    else if (userRole === 'admin') {
      console.log('🛡️ Admin, showing all properties');
    }

    // Filter by location
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseInt(req.query.maxPrice);
    }

    // Optional: Filter by status (admins and owners can filter)
    if (req.query.status && req.user) {
      if (userRole === 'admin') {
        filter.status = req.query.status;
      } else if (userRole === 'owner') {
        // When owner filters by status, only affect their own properties
        filter.owner = userId;
        filter.status = req.query.status;
      }
    }

    console.log('📌 Final filter:', JSON.stringify(filter, null, 2));

    // Get properties
    const properties = await Property.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    console.log('📊 Properties found:', properties.length);

    // Get total count for pagination
    const total = await Property.countDocuments(filter);
    console.log('📊 Total count:', total);
    console.log('====================================');

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: properties
    });
  } catch (error) {
    console.error('❌ Error in getProperties:', error);
    next(error);
  }
};

// ===========================================
// 3. GET SINGLE PROPERTY
// ===========================================
/**
 * GET /api/properties/:id
 * Purpose: Get a single property by ID
 * Access: Public (all roles)
 */
const getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if property is deleted
    if (property.deletedAt) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Regular users can only see published properties
    if ((!req.user || req.user.role === 'user') && property.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Increment views
    property.views += 1;
    await property.save();

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
};

// ===========================================
// 4. UPDATE PROPERTY
// ===========================================
/**
 * PUT /api/properties/:id
 * Purpose: Update a property (Draft only)
 * Access: Private (Owner or Admin)
 */
const updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    // Only draft properties can be edited
    if (property.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft properties can be edited'
      });
    }

    property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: property
    });
  } catch (error) {
    next(error);
  }
};

// ===========================================
// 5. PUBLISH PROPERTY
// ===========================================
/**
 * POST /api/properties/:id/publish
 * Purpose: Publish a draft property
 * Access: Private (Owner or Admin)
 */
const publishProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to publish this property'
      });
    }

    // Check if already published
    if (property.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Property is already published'
      });
    }

    // Check if archived
    if (property.status === 'archived') {
      return res.status(400).json({
        success: false,
        message: 'Archived properties cannot be published'
      });
    }

    // Validate required fields
    const requiredFields = ['title', 'description', 'location', 'price', 'images'];
    for (const field of requiredFields) {
      if (!property[field] || (Array.isArray(property[field]) && property[field].length === 0)) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    // Publish the property
    property.status = 'published';
    property.publishedAt = new Date();
    await property.save();

    res.status(200).json({
      success: true,
      message: 'Property published successfully',
      data: property
    });
  } catch (error) {
    next(error);
  }
};

// ===========================================
// 6. DELETE PROPERTY (Soft Delete)
// ===========================================
/**
 * DELETE /api/properties/:id
 * Purpose: Soft delete a property (Owner or Admin only)
 * Access: Private (Owner or Admin)
 */
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }

    // Soft delete
    property.deletedAt = new Date();
    property.status = 'archived';
    await property.save();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ===========================================
// 7. RESTORE PROPERTY (Admin only)
// ===========================================
/**
 * POST /api/properties/:id/restore
 * Purpose: Restore a soft-deleted property (Admin only)
 * Access: Private (Admin only)
 */
const restoreProperty = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can restore properties'
      });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (!property.deletedAt) {
      return res.status(400).json({
        success: false,
        message: 'Property is not deleted'
      });
    }

    property.deletedAt = null;
    property.status = 'draft';
    await property.save();

    res.status(200).json({
      success: true,
      message: 'Property restored successfully',
      data: property
    });
  } catch (error) {
    next(error);
  }
};

// ===========================================
// EXPORT CONTROLLER FUNCTIONS
// ===========================================

module.exports = {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  publishProperty,
  deleteProperty,
  restoreProperty
};