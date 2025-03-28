const User = require('../models/userModel');

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

module.exports = authMiddleware;