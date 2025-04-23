const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Secret key for JWT - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Legacy authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    // Get authorization token from the request headers
    const token = req.headers['authorization'] || req.headers['x-user-id'];
    
    if (!token) {
      return res.status(401).json({ 
        error: true, 
        message: 'Authentication required. Please provide a token in the Authorization header.' 
      });
    }
    
    let userId;
    
    // Check if it's a simple user ID or a token
    if (token.includes(':')) {
      // It's a session token, decode it
      try {
        const decodedToken = Buffer.from(token, 'base64').toString();
        const [tokenUserId] = decodedToken.split(':');
        userId = tokenUserId;
      } catch (tokenError) {
        return res.status(401).json({
          error: true,
          message: 'Invalid authentication token'
        });
      }
    } else {
      // It's a direct user ID (for backward compatibility)
      userId = token;
    }
    
    // Get the user from the database
    const user = await User.getById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: true, 
        message: 'User not found' 
      });
    }
    
    // Attach the user to the request object
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(500).json({ 
      error: true, 
      message: 'Authentication error' 
    });
  }
};

// JWT Authentication middleware for Google OAuth users
const authenticateJWT = async (req, res, next) => {
  try {
    // Get the token from Authorization header (Format: "Bearer TOKEN")
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Check for token in localStorage format
      const token = req.headers['x-auth-token'] || req.headers['x-user-token'];
      
      if (token) {
        try {
          // For localStorage tokens, try to find user by ID
          const userData = JSON.parse(token);
          if (userData && userData.id) {
            const user = await User.getById(userData.id);
            if (user) {
              req.user = user;
              return next();
            }
          }
        } catch (e) {
          // If parsing fails, continue to error
        }
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid token.'
        });
      }
      
      // Try to find the user in the database
      try {
        // For Google OAuth users, we look for auth_id matching the sub
        const user = await User.getByEmail(decoded.email);
        
        if (!user) {
          return res.status(404).json({
            success: false, 
            message: 'User associated with this token no longer exists.'
          });
        }
        
        // Add user info to request
        req.user = user;
        next();
      } catch (error) {
        console.error('Error finding user from JWT token:', error);
        return res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    });
  } catch (error) {
    console.error('JWT Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  authMiddleware,
  authenticateJWT
};