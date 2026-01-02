const express = require('express');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { messages, model = 'claude-sonnet-4-20250514', max_tokens = 4096 } = req.body;

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      { model, max_tokens, messages },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    await prisma.usage.create({
      data: {
        userId: req.user.id,
        service: 'anthropic',
        requests: 1,
        tokens: response.data.usage.input_tokens + response.data.usage.output_tokens,
        cost: (response.data.usage.input_tokens * 0.003 + response.data.usage.output_tokens * 0.015) / 1000
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/refine-code', authenticateToken, async (req, res) => {
  try {
    const { code, instructions } = req.body;

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        messages: [{
          role: 'user',
          content: `Refine this code:\n\n\`\`\`\n${code}\n\`\`\`\n\nInstructions: ${instructions}`
        }]
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    res.json({ refined: response.data.content[0].text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
