// middleware/authMiddleware.js
require('dotenv').config(); 
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;  // Use the same secret key as in jwt.sign()

const authMiddleware = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.header('Authorization')?.split(' ')[1]; // Expect "Bearer TOKEN"

  // Check if no token is provided
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach the decoded user to the request object
    req.user = decoded;
    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
