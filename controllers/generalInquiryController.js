// controllers/generalInquiryController.js
const GeneralInquiry = require('../models/generalInquiryModel');

const submitGeneralInquiry = async (req, res) => {
  try {
    const { inquiryType, name, email, phone, message } = req.body;

    if (!inquiryType || !name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const inquiry = await GeneralInquiry.create({
      inquiryType,
      name,
      email,
      phone,
      message,
    });

    return res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: inquiry,
    });
  } catch (err) {
    console.error('Error submitting general inquiry:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
const getgeneralInquiryById = async (req, res) => {
  const { id } = req.params;
  try {
    const inquiry = await GeneralInquiry.findByPk(id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
    res.status(200).json({ success: true, data: inquiry });
  } catch (error) {
    console.error('Error fetching inquiry by ID:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get all general inquiries
const getAllgeneralInquiries = async (req, res) => {
  try {
    const inquiries = await GeneralInquiry.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json({ success: true, data: inquiries });
  } catch (error) {
    console.error('Error fetching all inquiries:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = { submitGeneralInquiry,
    getgeneralInquiryById,
  getAllgeneralInquiries
 };
