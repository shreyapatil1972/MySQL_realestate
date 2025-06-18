const Property = require('../models/propertyModel');
const { Op, Sequelize } = require('sequelize');
const path = require('path');      
const fs = require('fs');         

// Get all properties
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.findAll();

    // Verify image existence and build URLs
    const modifiedProperties = await Promise.all(properties.map(async (property) => {
      let imageUrl = null;
      
      if (property.image) {
        const imagePath = path.join(__dirname, '../uploads', property.image);
        
        // Check if image file exists
        try {
          await fs.promises.access(imagePath, fs.constants.F_OK);
          imageUrl = `${req.protocol}://${req.get('host')}/uploads/${property.image}`;
        } catch (err) {
          console.warn(`Image not found: ${property.image}`);
          // You could also set a default image here if desired
          // imageUrl = '/images/default-property.jpg';
        }
      }

      return {
        id: property.id,
        title: property.title,
        price: property.price,
        city: property.city,
        description: property.description,
        type: property.type,
        size: property.size,
        area: property.area,
        bedroom: property.bedroom,
        bathroom: property.bathroom,
        garage: property.garage,
        year: property.year,
        address: property.address,
        zip_code: property.zip_code,
        city_area: property.city_area,
        state: property.state,
        country: property.country,
        image: imageUrl
      };
    }));

    res.status(200).json({ 
      success: true,
      count: modifiedProperties.length,
      properties: modifiedProperties 
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

// Get property by ID
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found', success: false });
    }

    const modifiedProperty = {
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      city: property.city,
      type: property.type,
      size: property.size,
      area: property.area,
      bedroom: property.bedroom,
      bathroom: property.bathroom,
      garage: property.garage,
      year: property.year,
      address: property.address,
      zip_code: property.zip_code,
      city_area: property.city_area,
      state: property.state,
      country: property.country,
      image: property.image ? `http://localhost:7000/uploads/${property.image}` : null
    };

    res.status(200).json({ property: modifiedProperty, success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get property', details: error.message });
  }
};


// Create a new property
const createProperty = async (req, res) => {
  try {
    const {
      title, price, city, description, type, size, area,
      bedroom, bathroom, garage, year, address, zip_code,
      city_area, state, country
    } = req.body;

    const image = req.file?.filename;

    if (!image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const newProperty = await Property.create({
      title,
      price,
      city,
      description,
      type,
      image,
      size,
      area,
      bedroom,
      bathroom,
      garage,
      year,
      address,
      zip_code,
      city_area,
      state,
      country
    });

    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create property', details: error.message });
  }
};

// Update property
const updateProperty = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(401).json({ success: false, message: 'Not Authorized' });
    }

    const { id } = req.params;
    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const {
      title, description, price, city, type,
      size, area, bedroom, bathroom, garage,
      year, address, zip_code, city_area, state, country
    } = req.body;

    const updatedData = {
      title,
      description,
      price: parseFloat(price),
      city,
      type,
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
    };

    if (req.file) {
      const newImage = req.file.filename;

      // Delete old image
      if (property.image) {
        const oldImagePath = path.join(__dirname, "../uploads", property.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      updatedData.image = newImage;
    }

    await Property.update(updatedData, { where: { id } });
    return res.status(200).json({ success: true, message: "Property updated successfully" });

  } catch (error) {
    console.error("Update Property Error:", error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

// Delete property
const deleteProperty = async (req, res) => {
  try {
    // Admin check
    if (!req.user.isAdmin) {
      return res.status(401).json({ success: false, message: 'Not Authorized' });
    }

    const { id } = req.params;

    // Find the property
    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Delete image if exists
    if (property.image) {
      const imagePath = path.join(__dirname, '../uploads', property.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Failed to delete image:', err);
      });
    }

    // Delete the property from DB
    await Property.destroy({ where: { id } });

    res.status(200).json({ success: true, message: 'Property deleted successfully' });

  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

// Search properties
// In propertyController.js
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
    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    // Error handling
  }
};const getFilterOptions = async (req, res) => {
  try {
    const propertyTypes = await Property.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('type')), 'type']]
    });

    const locations = await Property.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('city')), 'city']]
    });

    const bedroomSizes = await Property.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('bedroom')), 'bedroom']]
    });

    res.json({
      propertyTypes: propertyTypes.map(p => p.type),
      locations: locations.map(l => l.city),
      bedroomSizes: bedroomSizes.map(b => b.bedroom)
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  getFilterOptions
};
