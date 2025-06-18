const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Inquiry = sequelize.define('Inquiry', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    inquiryType: {
        type: DataTypes.ENUM('General', 'Property-Specific'),
        allowNull: false,
        defaultValue: 'Property-Specific'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
      model: 'Users',   
      key: 'id'
    }
    },
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
      model: 'Properties',  // 👈 Match actual table name if different
      key: 'id'
    }
    }
}, {
    tableName: 'inquiries',
    timestamps: true
});

module.exports = Inquiry;
