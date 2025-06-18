const jwt = require('jsonwebtoken');
require("dotenv").config();

// Auth middleware to validate token and extract user info
const auth = async (req, res, next) => {
  try {
    const tokenBearer = req.headers.authorization;

    if (!tokenBearer || !tokenBearer.startsWith('Bearer ')) {
      return res.status(401).send({ message: "Invalid or missing authorization header" });
    }

    const token = tokenBearer.split(' ')[1];

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    req.user = decoded; // this includes id and isAdmin (if added at login)
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).send({ message: "Unauthorized", error: error.message });
  }
};

// isAdmin middleware to check if the logged-in user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // User is admin
  } else {
    res.status(403).json({ message: "Forbidden: Admin access required" });
  }
};

module.exports = { auth, isAdmin };
