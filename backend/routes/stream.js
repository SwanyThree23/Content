const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/start', authenticateToken, async (req, res) => {
  try {
    const { config } = req.body;

    const stream = await prisma.stream.create({
      data: {
        userId: req.user.id,
        config: JSON.stringify(config),
        status: 'live'
      }
    });

    res.json({ stream });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/stop', authenticateToken, async (req, res) => {
  try {
    const { streamId } = req.body;

    await prisma.stream.update({
      where: { id: streamId },
      data: { status: 'ended', endedAt: new Date() }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/active', authenticateToken, async (req, res) => {
  try {
    const streams = await prisma.stream.findMany({
      where: { userId: req.user.id, status: 'live' }
    });
    res.json({ streams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
