const express = require('express');
const router = express.Router();
const Itinerary = require('../models/itineraryModel');
const { authenticateJWT } = require('../middlewares/authMiddleware');

// Create a new itinerary
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { title, start_date, end_date, destination, description, json_data } = req.body;
    
    // Get auth_id from the authenticated user
    const auth_id = req.user.sub || req.user.auth_id;
    
    // Validate required fields
    if (!title || !start_date || !end_date || !destination || !json_data) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: title, start_date, end_date, destination, and json_data are required' 
      });
    }
    
    const newItinerary = await Itinerary.create({
      auth_id,
      title,
      start_date,
      end_date,
      destination,
      description: description || '',
      json_data
    });
    
    res.status(201).json({ success: true, itinerary: newItinerary });
  } catch (error) {
    console.error('Error creating itinerary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all itineraries for the authenticated user
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const auth_id = req.user.sub || req.user.auth_id;
    const itineraries = await Itinerary.getAllByUser(auth_id);
    
    // Parse JSON data before sending response
    const parsedItineraries = itineraries.map(itinerary => {
      try {
        return {
          ...itinerary,
          json_data: JSON.parse(itinerary.json_data)
        };
      } catch (e) {
        return itinerary; // Return as is if parsing fails
      }
    });
    
    res.json({ success: true, itineraries: parsedItineraries });
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get a specific itinerary by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const itinerary = await Itinerary.getById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }
    
    // Verify ownership
    const auth_id = req.user.sub || req.user.auth_id;
    if (itinerary.auth_id !== auth_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized: This itinerary belongs to another user' });
    }
    
    // Parse JSON data
    try {
      itinerary.json_data = JSON.parse(itinerary.json_data);
    } catch (e) {
      // Keep as is if parsing fails
    }
    
    res.json({ success: true, itinerary });
  } catch (error) {
    console.error(`Error fetching itinerary ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update an itinerary
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    // First fetch the itinerary to verify ownership
    const itinerary = await Itinerary.getById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }
    
    // Verify ownership
    const auth_id = req.user.sub || req.user.auth_id;
    if (itinerary.auth_id !== auth_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized: This itinerary belongs to another user' });
    }
    
    // Proceed with update
    const updatedItinerary = await Itinerary.update(req.params.id, req.body);
    
    // Parse JSON data
    try {
      updatedItinerary.json_data = JSON.parse(updatedItinerary.json_data);
    } catch (e) {
      // Keep as is if parsing fails
    }
    
    res.json({ success: true, itinerary: updatedItinerary });
  } catch (error) {
    console.error(`Error updating itinerary ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete an itinerary
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    // First fetch the itinerary to verify ownership
    const itinerary = await Itinerary.getById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
    }
    
    // Verify ownership
    const auth_id = req.user.sub || req.user.auth_id;
    if (itinerary.auth_id !== auth_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized: This itinerary belongs to another user' });
    }
    
    // Proceed with deletion
    const result = await Itinerary.delete(req.params.id);
    res.json(result);
  } catch (error) {
    console.error(`Error deleting itinerary ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;