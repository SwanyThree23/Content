const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.query;

    const messages = await prisma.message.findMany({
      where: {
        userId: req.user.id,
        ...(projectId && { projectId })
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/message', authenticateToken, async (req, res) => {
  try {
    const { projectId, role, content } = req.body;

    const message = await prisma.message.create({
      data: {
        userId: req.user.id,
        projectId,
        role,
        content
      }
    });

    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
