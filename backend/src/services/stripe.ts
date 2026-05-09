import Stripe from 'stripe';
import { supabase } from '../config/database';
import { sendEmail } from './email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

const TIER_LIMITS: Record<string, number> = {
  free: 100,
  starter: 1000,
  pro: 10000,
  enterprise: 100000
};

export async function createCheckoutSession(userId: string, email: string, priceId: string) {
  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.FRONTEND_URL}/billing?success=true`,
    cancel_url: `${process.env.FRONTEND_URL}/billing?canceled=true`,
    customer_email: email,
    metadata: { userId }
  });
}

export async function createPortalSession(customerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.FRONTEND_URL}/billing`
  });
}

export async function handleWebhook(body: Buffer, sig: string) {
  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId } = session.metadata!;
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = subscription.items.data[0].price.id;
      const tier = getTierFromPriceId(priceId);

      await supabase.from('users').update({
        tier,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        api_calls_limit: TIER_LIMITS[tier]
      }).eq('id', userId);

      const { data: user } = await supabase.from('users').select('email').eq('id', userId).single();
      if (user) {
        await sendEmail({
          to: user.email,
          subject: 'Payment Successful - SwanyBot Live',
          template: 'payment_success',
          data: { amount: (session.amount_total! / 100).toFixed(2) }
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase.from('users').update({
        tier: 'free',
        api_calls_limit: TIER_LIMITS.free,
        stripe_subscription_id: null
      }).eq('stripe_subscription_id', subscription.id);
      break;
    }
  }
}

function getTierFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_PRICE_ID_STARTER) return 'starter';
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return 'pro';
  if (priceId === process.env.STRIPE_PRICE_ID_ENTERPRISE) return 'enterprise';
  return 'free';
}
