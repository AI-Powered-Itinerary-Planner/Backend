const express = require('express');
const router = express.Router();
const Itinerary = require('../models/itineraryModel');
const { authenticateJWT } = require('../middlewares/authMiddleware');




router.post('/generate', async (req, res) => {
  const { prompt } = req.body;
  console.log("Received prompt:", prompt);
  console.log("route hit");
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
    const itinerary = data?.choices?.[0]?.message?.content || 'No response from AI';

    res.status(200).json({ itinerary });
  } catch (error) {
    console.error('DeepSeek error:', error.message);
    res.status(500).json({ error: 'Something went wrong generating itinerary' });
  }
});

router.post('/converse', async (req, res) => {
  const { messages } = req.body;
  console.log("Received messages:", messages);

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages
      })
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    res.status(200).json({ reply });
  } catch (error) {
    console.error("DeepSeek error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// Create a new itinerary
router.post('/', async (req, res) => {
  try {
    const { auth_id, title, start_date, end_date, destination, description, json_data } = req.body;
    console.log('Received itinerary data:', req.body);
    
    // Get auth_id from the authenticated user
    console.log('Authenticated user ID:', auth_id);
    
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
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const itineraries = await Itinerary.getAllByUser(userId);
    
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
router.get('/:id', async (req, res) => {
  try {
    const itinerary = await Itinerary.getById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' });
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