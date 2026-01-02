const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/servers', authenticateToken, async (req, res) => {
  try {
    const servers = await prisma.mCPServer.findMany();
    res.json({ servers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/servers', authenticateToken, async (req, res) => {
  try {
    const { name, type, config } = req.body;

    const server = await prisma.mCPServer.create({
      data: { name, type, config: JSON.stringify(config), status: 'connected' }
    });

    res.json({ server });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
