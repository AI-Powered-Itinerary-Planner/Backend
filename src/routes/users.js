const express = require('express');
const User = require('../models/userModel');
const router = express.Router();

// TODO: Add routes here
// Placeholder route for creating a user
router.post('/', (req, res) => {
   // Loading...
   res.send("User route is loading...");
})

// Placeholder route for getting a user by ID
router.get('/user/:id', (req, res) => {
    res.send(`User route for ID ${req.params.id} is loading...`);
  });

module.exports = router;