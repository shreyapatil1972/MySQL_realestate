const express = require('express');
const inquiryController = require('../controllers/inquiryController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Public: Anonymous users can submit inquiries
router.post('/submit', inquiryController.submitInquiry);

// Public: Get inquiry by ID or by property
router.get('/getInquiryById/:id', inquiryController.getInquiryById);
router.get('/byProperty/:propertyId', inquiryController.getInquiriesByProperty);

// Protected: Only logged-in users can view their inquiries
router.get('/byUser', auth, inquiryController.getInquiriesByUser);

// Admin: Get all inquiries (requires auth middleware, assuming admin check is handled inside)
router.get('/getAllInquiry', auth, inquiryController.getAllInquiries);

module.exports = router;
