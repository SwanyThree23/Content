const express = require('express');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', authenticateToken, async (req, res) => {
  try {
    const { url, event } = req.body;

    const webhook = await prisma.webhook.create({
      data: {
        userId: req.user.id,
        url,
        event,
        active: true
      }
    });

    res.json({ webhook });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: { userId: req.user.id }
    });
    res.json({ webhooks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.webhook.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function triggerWebhook(userId, event, data) {
  const webhooks = await prisma.webhook.findMany({
    where: { userId, event, active: true }
  });

  for (const webhook of webhooks) {
    try {
      await axios.post(webhook.url, data);
      await prisma.webhook.update({
        where: { id: webhook.id },
        data: { calls: { increment: 1 }, lastFired: new Date() }
      });
    } catch (error) {
      console.error(`Webhook ${webhook.id} failed:`, error.message);
    }
  }
}

module.exports = router;
module.exports.triggerWebhook = triggerWebhook;
