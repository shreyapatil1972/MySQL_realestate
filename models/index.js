const User = require('./userModel');
const Property = require('./propertyModel');
const Inquiry = require('./inquiryModel');

// Associations

// User ↔️ Inquiry (1:M)
User.hasMany(Inquiry, { 
  foreignKey: 'userId', 
  onDelete: 'SET NULL', 
  as: 'inquiries' 
});
Inquiry.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

// Property ↔️ Inquiry (1:M)
Property.hasMany(Inquiry, { 
  foreignKey: 'propertyId', 
  onDelete: 'SET NULL', 
  as: 'inquiries' 
});
Inquiry.belongsTo(Property, { 
  foreignKey: 'propertyId', 
  as: 'property' 
});

module.exports = { User, Property, Inquiry };
