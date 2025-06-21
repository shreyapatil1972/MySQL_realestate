const express = require('express');
const router = express.Router();
const  generalInquiryController = require('../controllers/generalInquiryController');
const {auth}= require('../middleware/auth'); // adjust path as needed

router.post('/submit-general-inquiry',generalInquiryController.submitGeneralInquiry);
router.get('/getgeneralInquiryById/:id', generalInquiryController.getgeneralInquiryById);
router.get('/getAllgeneralInquiries', auth, generalInquiryController.getAllgeneralInquiries);

module.exports = router;
