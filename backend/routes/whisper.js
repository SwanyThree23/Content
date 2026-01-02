const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/transcribe', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    const form = new FormData();
    form.append('file', req.file.buffer, 'audio.webm');
    form.append('model', 'whisper-1');

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    res.json({ text: response.data.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
