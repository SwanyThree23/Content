const express = require('express');
const axios = require('axios');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { model, messages } = req.body;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      { model, messages },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://swanythree.com',
          'X-Title': 'SwanyThree Platform'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/models', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
