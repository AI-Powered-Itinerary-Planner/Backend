const express = require('express');
const router = express.Router();

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
  
  module.exports = router;