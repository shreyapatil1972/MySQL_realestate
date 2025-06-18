const User = require('./userModel');
const Property = require('./propertyModel');
const Inquiry = require('./inquiryModel');

// Associations
User.hasMany(Inquiry, { foreignKey: 'userId', onDelete: 'SET NULL', as: 'inquiries' });
Inquiry.belongsTo(User, { foreignKey: 'userId', as: 'user' }); // 🔥 Add 'as'

Property.hasMany(Inquiry, { foreignKey: 'propertyId', onDelete: 'SET NULL', as: 'inquiries' });
Inquiry.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' }); // 🔥 Add 'as'

module.exports = { User, Property, Inquiry };
