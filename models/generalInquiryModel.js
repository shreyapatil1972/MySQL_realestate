// models/GeneralInquiry.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GeneralInquiry = sequelize.define('GeneralInquiry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  inquiryType: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
}, {
  tableName: 'general_inquiries',
  timestamps: true,
});

module.exports = GeneralInquiry;
