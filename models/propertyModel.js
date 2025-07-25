const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Property = sequelize.define('Property', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    city: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    type: { type: DataTypes.ENUM('For Rent', 'For Sale'), allowNull: false },
image: { 
    type: DataTypes.STRING(255), 
    allowNull: false,
    get() {
  const rawValue = this.getDataValue('image');
  return rawValue ? `${process.env.BASE_URL || 'http://localhost:7000'}/uploads/${rawValue}` : null;
}

  },
    size: { type: DataTypes.STRING(100), allowNull: true },
    area: { type: DataTypes.STRING(100), allowNull: true },
    bedroom: { type: DataTypes.INTEGER, allowNull: true },
    bathroom: { type: DataTypes.INTEGER, allowNull: true },
    garage: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    year: { type: DataTypes.INTEGER, allowNull: true },
    address: { type: DataTypes.STRING(255), allowNull: false },
    zip_code: { type: DataTypes.STRING(20), allowNull: true },
    city_area: { type: DataTypes.STRING(100), allowNull: true },
    state: { type: DataTypes.STRING(100), allowNull: true },
    country: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'United States' },
}, {
    tableName: 'properties',
    timestamps: false
});

module.exports = Property;
