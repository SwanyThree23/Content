import express from 'express';
import { authenticateUser, requireAdmin, AuthRequest } from '../middleware/auth';
import { supabase } from '../config/database';

const router = express.Router();

router.use(authenticateUser, requireAdmin);

router.get('/stats', async (req, res) => {
  const [users, docs, totalApiCalls] = await Promise.all([
    supabase.from('users').select('id, tier, created_at', { count: 'exact' }),
    supabase.from('documents').select('id', { count: 'exact' }),
    supabase.from('users').select('api_calls_used')
  ]);

  const tierBreakdown = (users.data || []).reduce((acc: Record<string, number>, u) => {
    acc[u.tier] = (acc[u.tier] || 0) + 1;
    return acc;
  }, {});

  const totalCalls = (totalApiCalls.data || []).reduce((sum, u) => sum + (u.api_calls_used || 0), 0);

  res.json({
    totalUsers: users.count ?? 0,
    totalDocuments: docs.count ?? 0,
    totalApiCalls: totalCalls,
    tierBreakdown,
    mrr: (tierBreakdown.starter || 0) * 29 +
         (tierBreakdown.pro || 0) * 99 +
         (tierBreakdown.enterprise || 0) * 299
  });
});

router.get('/users', async (req, res) => {
  const { page = '1', limit = '20' } = req.query;
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  const { data, count } = await supabase
    .from('users')
    .select('id, email, full_name, tier, api_calls_used, api_calls_limit, created_at', { count: 'exact' })
    .range(offset, offset + parseInt(limit as string) - 1)
    .order('created_at', { ascending: false });

  res.json({ users: data, total: count, page: parseInt(page as string) });
});

router.patch('/users/:id/tier', async (req, res) => {
  const { tier } = req.body;
  const limits: Record<string, number> = { free: 100, starter: 1000, pro: 10000, enterprise: 100000 };

  const { data } = await supabase
    .from('users')
    .update({ tier, api_calls_limit: limits[tier] })
    .eq('id', req.params.id)
    .select()
    .single();

  res.json({ user: data });
});

router.delete('/users/:id', async (req, res) => {
  await supabase.from('users').delete().eq('id', req.params.id);
  res.json({ success: true });
});

export default router;
