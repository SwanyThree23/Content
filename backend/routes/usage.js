const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await prisma.usage.aggregate({
      where: { userId: req.user.id },
      _sum: { requests: true, tokens: true, cost: true }
    });

    const byService = await prisma.usage.groupBy({
      by: ['service'],
      where: { userId: req.user.id },
      _sum: { requests: true, tokens: true, cost: true }
    });

    res.json({
      total: {
        requests: stats._sum.requests || 0,
        tokens: stats._sum.tokens || 0,
        cost: stats._sum.cost || 0
      },
      byService
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const usage = await prisma.usage.findMany({
      where: {
        userId: req.user.id,
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
