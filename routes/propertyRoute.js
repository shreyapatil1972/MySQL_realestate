const express = require('express');
const propertyController = require('../controllers/propertyController');
const { auth } = require('../middleware/auth');
const multer = require('../middleware/multer');

const router = express.Router();

// Create property (with image upload & auth)
router.post('/createProperty', auth, multer.single('image'), propertyController.createProperty);

// Get all properties
router.get('/getAllProperties', propertyController.getAllProperties);

// Get property by ID
router.get('/getPropertyById/:id', propertyController.getPropertyById);

// Update property (with image upload & auth)
router.put('/updateProperty/:id', auth, multer.single('image'), propertyController.updateProperty);

// Delete property
router.delete('/deleteProperty/:id', auth, propertyController.deleteProperty);

// Search properties using filters (e.g., type, location, bedrooms, maxPrice)
router.get('/search', propertyController.searchProperties);

// 🚀 NEW: Get filter options for dropdowns (property types, locations, bedroom sizes)
router.get('/filters', propertyController.getFilterOptions);

module.exports = router;
