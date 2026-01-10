import express from 'express';
import { authenticateUser, checkApiQuota } from '../middleware/auth';
import { MasterAIService } from '../services/ai/master-ai';

const router = express.Router();
const aiService = new MasterAIService();

router.post('/chat', authenticateUser, checkApiQuota, async (req, res) => {
  const { messages, provider, model } = req.body;
  const response = await aiService.chat(messages, { provider, model });
  res.json(response);
});

router.post('/stream', authenticateUser, checkApiQuota, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');

  await aiService.streamChat(req.body.messages, (text) => {
    res.write(`data: ${JSON.stringify({ text })}\n\n`);
  });

  res.write('data: [DONE]\n\n');
  res.end();
});

export default router;
