const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Missing question input' });
  }

  console.log("Explore route hit with question:", question);

  try {
    const payload = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: `You are a friendly travel guide AI. Respond informally and clearly to the user's travel question in plain text. Avoid using markdown formatting, asterisks, or emojis.
          be concise but vivid.\n\nUser: "${question}"`
        }
      ]
    };
    console.log("Sending payload to DeepSeek:", JSON.stringify(payload, null, 2));

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    console.log("DeepSeek response status:", response.status);

    const data = await response.json();
    console.log("DeepSeek API raw response:", JSON.stringify(data, null, 2));
    const answer = data?.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    res.status(200).json({ answer });
  } catch (error) {
    console.error("Error in /explore route:", error.message);
    res.status(500).json({ error: 'Failed to generate explore response' });
  }
});

module.exports = router;