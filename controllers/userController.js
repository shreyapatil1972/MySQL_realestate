const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Register
const registerUser = async (req, res) => {
  const { name, email, password, isAdmin } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists', success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', success: false, error: error.message });
  }
};

// Login
const LoginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'User not found', success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password', success: false });
    }

    const payload = { id: user.id, isAdmin: user.isAdmin };
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '2h' });

    return res.status(200).json({
      message: 'Login successful',
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', success: false, error: error.message });
  }
};

// Get Logged-In User Info
const getUserInfo = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'isAdmin'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found', success: false });
    }

    return res.status(200).json({
      message: 'User info fetched successfully',
      success: true,
      loggedUser: user,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user info', success: false, error: error.message });
  }
};

module.exports = {
  registerUser,
  LoginUser,
  getUserInfo,
};
