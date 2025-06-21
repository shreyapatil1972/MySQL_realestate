const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('./config/db'); // Sequelize DB connection

// Route Imports
const userRoute = require('./routes/userRoute');
const propertyRoute = require('./routes/propertyRoute');
const inquiryRoute = require('./routes/inquiryModel')
const generalInquiryRoutes = require('./routes/generalInquiryModel');
const app = express();
const port = process.env.PORT || 7000;
 
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/', (req, res) => res.send('Hello World!'));

// API Routes
app.use('/api/users', userRoute);
app.use('/api/properties', propertyRoute);
app.use('/api/inquiries', inquiryRoute);
app.use('/api/general-inquiries', generalInquiryRoutes);
// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
