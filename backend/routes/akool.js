const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/face-swap', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { targetFaceUrl } = req.body;
    const form = new FormData();
    form.append('source_image', req.file.buffer, 'source.jpg');
    form.append('target_face_url', targetFaceUrl);

    const response = await axios.post(
      'https://api.akool.com/api/v1/faceswap',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'x-api-key': process.env.AKOOL_API_KEY
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/voice-clone', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    const { text, voiceId } = req.body;

    const response = await axios.post(
      'https://api.akool.com/api/v1/voice/clone',
      {
        text,
        voice_id: voiceId,
        audio_file: req.file.buffer.toString('base64')
      },
      {
        headers: { 'x-api-key': process.env.AKOOL_API_KEY }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/video-translate', authenticateToken, async (req, res) => {
  try {
    const { videoUrl, targetLanguage } = req.body;

    const response = await axios.post(
      'https://api.akool.com/api/v1/video/translate',
      { video_url: videoUrl, target_language: targetLanguage },
      {
        headers: { 'x-api-key': process.env.AKOOL_API_KEY }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
