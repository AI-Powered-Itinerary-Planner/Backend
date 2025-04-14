const express = require('express');
const User = require('../models/userModel');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
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

// Check if email exists
router.get('/check-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: true, message: 'Email is required' });
    }
    
    const user = await User.getByEmail(email);
    res.status(200).json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Profile routes - protected by authentication
// These must be placed before the /:id routes to avoid conflicts
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);

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
     
     // Generate a token for the new user
     const token = 'user-token-' + Date.now(); // This should be replaced with proper JWT token generation
     
     res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        token
     });
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

router.post('/login', async (req, res) => {
   try{
      const{email, password} = req.body;
      console.log(email,password);
      const user = await User.getByEmail(email);
      console.log(user);
      if(!user){
         return res.status(404).json({error: true, message: 'User not found'});
      }
      if(user.password !== password){
         return res.status(401).json({error: true, message: 'Invalid password'});
      }
      
      // Generate a token for the logged in user
      const token = 'user-token-' + Date.now(); // This should be replaced with proper JWT token generation
      
      res.status(200).json({
         success: true, 
         message: 'Login successful', 
         user,
         token
      });
   }catch(error){
      res.status(500).json({error: true, message: error.message});
   }
});

// Update a user
router.put('/:id', async (req, res) => {
  try {
     const { name, email, password, interests, age, country, zip_code, preferred_currency } = req.body;
     const user = await User.update(req.params.id, { name, email, password, interests, age, country, zip_code, preferred_currency });
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

// Get user's interests by ID
router.get('/:id/interests', async (req, res) => {
   try {
     const interests = await User.getInterestsById(req.params.id);
     res.status(200).json({ interests });
   } catch (error) {
     if (error.message === 'User not found') {
       return res.status(404).json({ error: true, message: 'User not found' });
     }
     res.status(500).json({ error: true, message: error.message });
   }
 });

module.exports = router;