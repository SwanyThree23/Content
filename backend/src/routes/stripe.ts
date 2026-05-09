import express from 'express';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { createCheckoutSession, createPortalSession, handleWebhook } from '../services/stripe';
import { supabase } from '../config/database';

const router = express.Router();

router.post('/checkout', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { priceId } = req.body;
    const session = await createCheckoutSession(req.user!.id, req.user!.email, priceId);
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/portal', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', req.user!.id)
      .single();

    if (!user?.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found' });
    }

    const session = await createPortalSession(user.stripe_customer_id);
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Stripe webhooks - must use raw body
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    await handleWebhook(req.body, sig);
    res.json({ received: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/plans', (req, res) => {
  res.json({
    plans: [
      {
        id: 'starter',
        name: 'Starter',
        price: 29,
        priceId: process.env.STRIPE_PRICE_ID_STARTER,
        apiCalls: 1000,
        features: ['1,000 API calls/month', 'All integrations', 'Email support']
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 99,
        priceId: process.env.STRIPE_PRICE_ID_PRO,
        apiCalls: 10000,
        features: ['10,000 API calls/month', 'Priority support', 'Custom webhooks', 'Team access']
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 299,
        priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE,
        apiCalls: 100000,
        features: ['100,000 API calls/month', 'Dedicated support', 'SLA', 'Custom integrations']
      }
    ]
  });
});

export default router;
