// N8N automation webhook endpoint
// Receives triggers from N8N workflows for automated episode generation/publishing

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import crypto from 'crypto';

const webhookSchema = z.object({
  event: z.enum([
    'generate_episode',
    'generate_videos',
    'upload_youtube',
    'publish_social',
    'alert_received',
    'payment_confirmed',
    'session_started',
    'session_ended',
  ]),
  series_id: z.string().uuid().optional(),
  episode_id: z.string().uuid().optional(),
  session_id: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expected}`)
  );
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-n8n-signature') || '';
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET || '';

    // Verify signature in production
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    const { event, series_id, episode_id, session_id, metadata } = webhookSchema.parse(body);

    let result: Record<string, unknown> = {};

    switch (event) {
      case 'generate_episode': {
        if (!series_id) return NextResponse.json({ error: 'Missing series_id' }, { status: 400 });
        // Trigger internal API
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/episodes/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
          },
          body: JSON.stringify({ series_id, episode_number: (metadata?.episode_number as number) || 1 }),
        });
        result = await res.json();
        break;
      }

      case 'generate_videos': {
        if (!episode_id) return NextResponse.json({ error: 'Missing episode_id' }, { status: 400 });
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/videos/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
          },
          body: JSON.stringify({ episode_id }),
        });
        result = await res.json();
        break;
      }

      case 'upload_youtube': {
        if (!episode_id) return NextResponse.json({ error: 'Missing episode_id' }, { status: 400 });
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/youtube/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
          },
          body: JSON.stringify({ episode_id, privacy_status: metadata?.privacy_status || 'public' }),
        });
        result = await res.json();
        break;
      }

      case 'alert_received': {
        // Store incoming alert (BMC, direct payment, etc.)
        if (metadata?.user_id) {
          await db.query(
            `INSERT INTO stream_alerts (user_id, session_id, alert_type, from_name, amount_cents, message, platform)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              metadata.user_id,
              session_id || null,
              metadata.alert_type || 'donation',
              metadata.from_name || 'Anonymous',
              metadata.amount_cents ? Number(metadata.amount_cents) : null,
              metadata.message || null,
              metadata.platform || 'n8n',
            ]
          );
        }
        result = { stored: true };
        break;
      }

      case 'payment_confirmed': {
        if (metadata?.transaction_id) {
          await db.query(
            `UPDATE payment_transactions SET status = 'confirmed', confirmed_at = NOW() WHERE id = $1`,
            [metadata.transaction_id]
          );
        }
        result = { updated: true };
        break;
      }

      default:
        result = { acknowledged: event };
    }

    // Log webhook execution
    await db.query(
      `INSERT INTO workflow_executions (workflow_id, trigger_type, status, output_data, started_at, completed_at)
       VALUES ($1, $2, 'completed', $3, NOW(), NOW())`,
      ['n8n-webhook', event, JSON.stringify(result)]
    );

    return NextResponse.json({
      success: true,
      event,
      result,
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
