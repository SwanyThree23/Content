import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseBmcWebhookPayload } from '@/lib/streaming/buy-me-coffee';
import { z } from 'zod';

// Buy Me a Coffee webhook handler
export async function POST(request: NextRequest) {
  try {
    const userKey = request.nextUrl.searchParams.get('user_key');
    const body = await request.json();

    const alert = parseBmcWebhookPayload(body);
    if (!alert) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Find user by BMC user key
    let userId: string | null = null;
    if (userKey) {
      const result = await db.query(
        `SELECT id FROM users WHERE buy_me_coffee_user_key = $1 LIMIT 1`,
        [userKey]
      );
      userId = result.rows[0]?.id || null;
    }

    if (userId) {
      await db.query(
        `INSERT INTO stream_alerts (user_id, alert_type, from_name, amount_cents, currency, message, platform, external_id)
         VALUES ($1, $2, $3, $4, $5, $6, 'buy_me_coffee', $7)`,
        [
          userId,
          alert.type,
          alert.from,
          alert.amount ? Math.round(alert.amount * 100) : null,
          alert.currency || 'USD',
          alert.message || null,
          body.id || null,
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Alert webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Get pending alerts for SSE stream
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');
  const userId = searchParams.get('user_id');

  if (!sessionId && !userId) {
    return NextResponse.json({ error: 'Missing session_id or user_id' }, { status: 400 });
  }

  const result = await db.query(
    `SELECT * FROM stream_alerts
     WHERE ${sessionId ? 'session_id = $1' : 'user_id = $1'}
     AND is_displayed = false
     ORDER BY created_at DESC
     LIMIT 20`,
    [sessionId || userId]
  );

  return NextResponse.json({ alerts: result.rows });
}
