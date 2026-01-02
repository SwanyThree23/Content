const express = require('express');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const apiKeys = await prisma.aPIKey.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        name: true,
        key: true,
        createdAt: true,
        lastUsed: true
      }
    });
    res.json({ apiKeys });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const key = `sk_${crypto.randomBytes(32).toString('hex')}`;

    const apiKey = await prisma.aPIKey.create({
      data: {
        userId: req.user.id,
        name,
        key
      }
    });

    res.json({ apiKey });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.aPIKey.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
