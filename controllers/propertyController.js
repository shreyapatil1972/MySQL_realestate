const Property = require('../models/propertyModel');
 
const path = require('path');
const fs = require('fs');

// Helper function to construct image URL
const handleFileUpload = (file) => {
    if (!file) return null;
    return file.filename;
}; 
// Helper function to construct full image URL
const getImageUrl = (req, filename) => {
  return filename ? `${req.protocol}://${req.get('host')}/uploads/${filename}` : null;
};
const resolveImageUrl = (req, image) => {
  if (!image) return null;
  return image.startsWith("http") ? image : getImageUrl(req, image);
};

// --- Get all properties ---
const { Op, Sequelize } = require('sequelize'); // Make sure to import Op

const getAllProperties = async (req, res) => {
  try {
    // Get filter from query parameters
    const { listingType, type, city, bedroom, maxPrice } = req.query;

    // Build the where clause based on filter
    const whereClause = {};

    if (listingType) {
      // Normalize listingType values: 'for-rent' → 'For Rent'
      const listingMap = {
        'for-rent': 'For Rent',
        'for-sale': 'For Sale'
      };
      const normalizedType = listingMap[listingType.toLowerCase()];
      if (normalizedType) {
        whereClause.listingType = normalizedType;
      }
    }

    if (type) whereClause.type = type;
    if (city) whereClause.city = city;
    if (bedroom) whereClause.bedroom = bedroom;
    if (maxPrice) whereClause.price = { [Op.lte]: maxPrice };

    const properties = await Property.findAll({
      where: whereClause,
      attributes: { 
        exclude: ['createdAt', 'updatedAt']
      }
    });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties: properties.map(property => {
        const propertyData = property.get({ plain: true });
        return {
          ...propertyData,
          price: parseFloat(propertyData.price),
          image: resolveImageUrl(req, propertyData.image)
        };
      })
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch properties',
      message: error.message
    });
  }
};

// --- Get property by ID ---
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    const structuredProperty = {
      // Main Header Info
      id: property.id,
      title: property.title,
      price: property.price,
      type: property.type,
      image: resolveImageUrl(req, property.image),

      // Address Info
      address: property.address,
      zip_code: property.zip_code,
      city: property.city,
      area: property.area,
      state: property.state,
      country: property.country,

      // Description
      description: property.description,

      // Overview
      year: property.year,
      size: property.size,
      bedroom: property.bedroom,
      bathroom: property.bathroom,
      garage: property.garage,

      // Details section
      details: {
        propertyId: `PR-${property.id.toString().padStart(6, '0')}`,
        propertySize: property.size,
        propertyType: property.type,
        bedrooms: property.bedroom,
        bathrooms: property.bathroom
      },

      // Optional features
      features: [
        'Air Conditioning', 'Dryer', 'Washer', 'TV Cable', 'Kitchen Appliances'
      ]
    };

    res.status(200).json({
      success: true,
      property: structuredProperty
    });

  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get property', 
      error: error.message 
    });
  }
};
// --- Create a new property ---
const createProperty = async (req, res) => {
  try {
    const {
      title, price, city, description, type, size, area,
      bedroom, bathroom, garage, year, address, zip_code,
      city_area, state, country,listingType
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image is required' 
      });
    }

    // Create property with filename stored in DB
    const newProperty = await Property.create({
      title,
      price: parseFloat(price),
      city,
      description,
      type,
      image: req.file.filename,
      size,
      area,
      bedroom: parseInt(bedroom),
      bathroom: parseInt(bathroom),
      garage: parseInt(garage),
      year: parseInt(year),
      address,
      zip_code,
      city_area,
      state,
      country
    });

    // Construct full image URL dynamically
    const fullImageUrl = `${req.protocol}://${req.get('host')}/uploads/${newProperty.image}`;

    res.status(201).json({ 
      success: true, 
      message: 'Property created', 
      property: {
        ...newProperty.toJSON(),
        image: resolveImageUrl(req, newProperty.image)

      }
    });

  } catch (error) {
    console.error('Property creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create property', 
      details: error.message 
    });
  }
};
 

// --- Update property ---
const updateProperty = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not Authorized' 
      });
    }

    const { id } = req.params;
    const property = await Property.findByPk(id);
    
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    const {
      title, description, price, city, type, size, area,
      bedroom, bathroom, garage, year, address, zip_code,
      city_area, state, country
    } = req.body;

    const updatedData = {
      title,
      description,
      price: parseFloat(price),
      city,
      type,
      size: parseInt(size),
      area,
      bedroom: parseInt(bedroom),
      bathroom: parseInt(bathroom),
      garage: parseInt(garage),
      year: parseInt(year),
      address,
      zip_code,
      city_area,
      state,
      country
    };

    if (req.file) {
      // Delete old image if exists
      if (property.image) {
        const oldImagePath = path.join(__dirname, '../uploads', property.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updatedData.image = req.file.filename;
    }

    await property.update(updatedData);
    await property.reload();
    res.status(200).json({ 
      success: true, 
      message: 'Property updated successfully',
      property: {
        ...property.toJSON(),
        image: resolveImageUrl(req, updatedData.image || property.image)

      }
    });

  } catch (error) {
    console.error('Update Property Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error', 
      error: error.message 
    });
  }
};

// --- Delete property ---
const deleteProperty = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not Authorized' 
      });
    }

    const { id } = req.params;
    const property = await Property.findByPk(id);
    
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        message: 'Property not found' 
      });
    }

    // Delete associated image
    if (property.image) {
      const filename = path.basename(property.image);
      const imagePath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await property.destroy();
    res.status(200).json({ 
      success: true, 
      message: 'Property deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error', 
      error: error.message 
    });
  }
};

// --- Search properties ---
const searchProperties = async (req, res) => {
  try {
    const { query, type, minPrice, maxPrice, bedrooms } = req.query;
    const where = {};

    if (query) {
      where[Op.or] = [
        { title: { [Op.like]: `%${query}%` } },
        { city: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } }
      ];
    }

    if (type) where.type = type;
    if (bedrooms) where.bedroom = bedrooms;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    const properties = await Property.findAll({ where });

    const modifiedProperties = properties.map(property => ({
      ...property.toJSON(),
      image: resolveImageUrl(req, property.image)

    }));

    res.status(200).json({ 
      success: true, 
      count: modifiedProperties.length, 
      properties: modifiedProperties 
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Search failed', 
      details: error.message 
    });
  }
};

// --- Get filter options ---
const getFilterOptions = async (req, res) => {
  try {
    const propertyTypes = await Property.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('type')), 'type']],
      order: [['type', 'ASC']]
    });

    const locations = await Property.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('city')), 'city']],
      order: [['city', 'ASC']]
    });

    const bedroomSizes = await Property.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('bedroom')), 'bedroom']],
      order: [['bedroom', 'ASC']]
    });

    res.status(200).json({
      success: true,
      propertyTypes: propertyTypes.map(p => p.type),
      locations: locations.map(l => l.city),
      bedroomSizes: bedroomSizes.map(b => b.bedroom).sort((a, b) => a - b)
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error', 
      message: error.message 
    });
  }
};
const getRentProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      where: { listingType: 'for-rent' },
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      properties: properties.map(formatProperty)
    });
  } catch (error) {
    handleError(res, error, 'Error fetching rental properties');
  }
};

const getSaleProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      where: { listingType: 'for-sale' },
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      properties: properties.map(p => formatProperty(p, req))
    });
  } catch (error) {
    handleError(res, error, 'Error fetching properties for sale');
  }
};

// Helper functions
const formatProperty = (property, req) => {
  const propertyData = property.get({ plain: true });
  return {
    ...propertyData,
    price: parseFloat(propertyData.price),
    image: resolveImageUrl(req, propertyData.image)

  };
};


const handleError = (res, error, defaultMessage) => {
  console.error(error);
  res.status(500).json({
    success: false,
    error: defaultMessage,
    message: error.message
  });
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  getFilterOptions,getRentProperties,getSaleProperties
};