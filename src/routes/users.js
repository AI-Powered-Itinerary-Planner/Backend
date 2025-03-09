const express = require('express');
const User = require('../models/userModel');
const router = express.Router();
// Get all users
router.get('/', async (req, res) => {
  try {
     const users = await User.getAll();
     res.status(200).json(users);
  } catch (error) {
     res.status(500).json({ error: true, message: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
     const user = await User.getById(req.params.id);
     if (!user) {
        return res.status(404).json({ error: true, message: 'User not found' });
     }
     res.status(200).json(user);
  } catch (error) {
     res.status(500).json({ error: true, message: error.message });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  try {
     const { name, email, password } = req.body;
     
     // Basic validation
     if (!name || !email || !password) {
        return res.status(400).json({ 
           error: true, 
           message: 'Name, email, and password are required' 
        });
     }
     
     const user = await User.create({ name, email, password });
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
});

// Update a user
router.put('/:id', async (req, res) => {
  try {
     const { name, email, password } = req.body;
     const user = await User.update(req.params.id, { name, email, password });
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
});

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
     await User.delete(req.params.id);
     res.status(204).send();
  } catch (error) {
     if (error.message === 'User not found') {
        return res.status(404).json({ error: true, message: 'User not found' });
     }
     res.status(500).json({ error: true, message: error.message });
  }
});
module.exports = router;