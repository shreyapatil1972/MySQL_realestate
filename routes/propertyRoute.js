// routes/propertyRoute.js
const express = require('express');
const propertyController = require('../controllers/propertyController');
const { auth } = require('../middleware/auth'); // Assuming you have an auth middleware
const multerMiddleware = require('../middleware/multer'); // Import your configured multer instance

const router = express.Router();

// Route for creating a property with image upload
// 'upload.single('image')' uses the middleware from middleware/multer.js
router.post('/createProperty', auth, multerMiddleware.single('image'), propertyController.createProperty);

// Route for updating a property with a potential new image upload
router.put('/updateProperty/:id', auth, multerMiddleware.single('image'), propertyController.updateProperty);

// Existing routes (no changes needed here if they work as intended)
router.get('/getAllProperties', propertyController.getAllProperties);
router.get('/getPropertyById/:id', propertyController.getPropertyById);
router.delete('/deleteProperty/:id', auth, propertyController.deleteProperty);
router.get('/search', propertyController.searchProperties);
router.get('/filters', propertyController.getFilterOptions);
router.get('/for-rent', propertyController.getRentProperties);
router.get('/for-sale', propertyController.getSaleProperties);

module.exports = router;