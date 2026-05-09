import express from 'express';
import { authenticateUser } from '../middleware/auth';
import { supabase } from '../config/database';
import crypto from 'crypto';

const router = express.Router();

router.post('/create', authenticateUser, async (req, res) => {
  const { url, events } = req.body;
  const secret = crypto.randomBytes(32).toString('hex');

  const { data } = await supabase.from('webhooks').insert({
    user_id: req.user.id,
    url,
    events,
    secret
  }).select().single();

  res.json({ webhook: data, secret });
});

router.delete('/:id', authenticateUser, async (req, res) => {
  await supabase.from('webhooks').delete().eq('id', req.params.id).eq('user_id', req.user.id);
  res.json({ success: true });
});

export default router;
