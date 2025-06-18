const { Inquiry, Property, User } = require('../models');

// Submit an inquiry (Anonymous or Authenticated)
const submitInquiry = async (req, res) => {
  try {
    const { name, email, phone, message, propertyId } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        error: "Name, email, phone, and message are required",
      });
    }

    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      message,
      propertyId: propertyId || null,
 
      inquiryType: propertyId ? 'Property-Specific' : 'General',
    });

    return res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      data: inquiry,
    });
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Get inquiry by ID
const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id, {
      
      attributes: [
        'id',
        'name',
        'email',
        'phone',
        'message',
        'inquiryType',
        'userId',        // <-- Needed
        'propertyId',    // <-- Needed
        'createdAt'
      ],
      include: [
        { model: User, attributes: ['id', 'name', 'email'], as: 'user' },
        { model: Property, attributes: ['id', 'title', 'price'], as: 'property' },
      ],
    });

    if (!inquiry) {
      return res.status(404).json({ success: false, error: "Inquiry not found" });
    }

    return res.status(200).json({ success: true, data: inquiry });
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
 
const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'], as: 'user' },
        { model: Property, attributes: ['id', 'title'], as: 'property' },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get inquiries by property ID (public)
const getInquiriesByProperty = async (req, res) => {
  try {
    const inquiries = await Inquiry.findAll({
      where: { propertyId: req.params.propertyId },
      include: [
        { model: User, attributes: ['id', 'name', 'email'], as: 'user' },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    console.error("Error fetching property inquiries:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get inquiries submitted by the logged-in user
const getInquiriesByUser = async (req, res) => {
  try {
    const inquiries = await Inquiry.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Property, attributes: ['id', 'title', 'price'], as: 'property' },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    console.error("Error fetching user inquiries:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

module.exports = {
  submitInquiry,
  getInquiryById,
  getAllInquiries,
  getInquiriesByProperty,
  getInquiriesByUser,
};
