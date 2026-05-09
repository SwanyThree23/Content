import express from 'express';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();

router.post('/vdoninja/create-room', authenticateUser, async (req: AuthRequest, res) => {
  const { roomId, streamId } = req.body;
  const password = crypto.randomBytes(8).toString('hex');

  const room = {
    roomId,
    streamId,
    password,
    hostUrl: `https://vdo.ninja/?room=${roomId}&password=${password}&director`,
    guestUrl: `https://vdo.ninja/?room=${roomId}&password=${password}`,
    createdAt: new Date().toISOString(),
    createdBy: req.user!.id
  };

  res.json({ room });
});

router.post('/vdoninja/invite', authenticateUser, async (req: AuthRequest, res) => {
  const { roomId, password } = req.body;
  res.json({
    inviteUrl: `https://vdo.ninja/?room=${roomId}&password=${password}`,
    viewUrl: `https://vdo.ninja/?view=${roomId}`
  });
});

router.get('/status', authenticateUser, (req, res) => {
  res.json({
    status: 'ready',
    providers: ['vdoninja', 'prism', 'evmux'],
    timestamp: new Date().toISOString()
  });
});

export default router;
