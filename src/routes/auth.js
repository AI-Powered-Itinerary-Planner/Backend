const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

// Google OAuth login/register endpoint
router.post('/google', async (req, res) => {
  try {
    console.log('Received Google OAuth request:', req.body);
    const { name, email, sub } = req.body;
    
    if (!email || !sub) {
      console.log('Missing required fields:', { email, sub });
      return res.status(400).json({
        success: false,
        message: 'Email and sub (Google ID) are required'
      });
    }
    
    try {
      // Create or update user with Google data
      const user = await User.createOrUpdateFromGoogle({ name, email, sub });
      console.log('User after createOrUpdateFromGoogle:', user);
      
      if (!user || !user.id) {
        console.error('User object is invalid:', user);
        return res.status(500).json({
          success: false,
          message: 'Failed to create or retrieve user',
          debug: { user }
        });
      }
      
      // Create a simple session token (in a real app, you'd use JWT or another token system)
      const sessionToken = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');
      
      res.status(200).json({
        success: true,
        message: 'Google authentication successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          auth_provider: 'google'
        },
        token: sessionToken
      });
    } catch (userError) {
      console.error('Error in user creation/update:', userError);
      return res.status(500).json({
        success: false,
        message: 'Error processing user data',
        error: userError.message
      });
    }
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
