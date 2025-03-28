const User = require('../models/userModel');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get a user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.getById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, interests, age, country, zip_code, preferred_currency } = req.body;
    
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: true, 
        message: 'Name, email, and password are required' 
      });
    }
    
    const user = await User.create({ 
      name, 
      email, 
      password, 
      interests, 
      age, 
      country, 
      zip_code, 
      preferred_currency 
    });
    res.status(201).json(user);
  } catch (error) {
    // Check for unique constraint violation (email already exists)
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ 
        error: true, 
        message: 'Email already in use' 
      });
    }
    
    res.status(500).json({ error: true, message: error.message });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, interests, age, country, zip_code, preferred_currency } = req.body;
    const user = await User.update(req.params.id, { 
      name, 
      email, 
      password, 
      interests, 
      age, 
      country, 
      zip_code, 
      preferred_currency 
    });
    res.status(200).json(user);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    if (error.message === 'No updates provided') {
      return res.status(400).json({ error: true, message: 'No updates provided' });
    }
    res.status(500).json({ error: true, message: error.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get user's interests by ID
exports.getUserInterestsById = async (req, res) => {
  try {
    const interests = await User.getInterestsById(req.params.id);
    res.status(200).json({ interests });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    res.status(500).json({ error: true, message: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, age, country, zip_code, preferred_currency } = req.body;
    
    // Get the user ID from the authenticated user
    const userId = req.user.id;
    
    // Update only profile fields
    const user = await User.update(userId, { 
      name, 
      age, 
      country, 
      zip_code, 
      preferred_currency 
    });
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    if (error.message === 'No updates provided') {
      return res.status(400).json({ error: true, message: 'No profile updates provided' });
    }
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    // Get the user ID from the authenticated user
    const userId = req.user.id;
    
    const user = await User.getById(userId);
    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }
    
    // Return only profile-related information
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      country: user.country,
      zip_code: user.zip_code,
      preferred_currency: user.preferred_currency
    };
    
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};