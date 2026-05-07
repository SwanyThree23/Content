// Full live session management API
// Supports: video/audio panels, private sessions, Meshcast CDN, direct payments, BMC

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { vdoNinja } from '@/lib/streaming/vdo-ninja';
import { getMeshcastUrl } from '@/lib/streaming/vdo-ninja-iframe';
import { z } from 'zod';

const createSessionSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  series_id: z.string().uuid().optional(),
  session_type: z.enum(['video', 'audio', 'screen']).default('video'),
  is_private: z.boolean().default(false),
  max_guests: z.number().int().min(1).max(12).default(9),
  direct_payments_enabled: z.boolean().default(true),
  buy_me_coffee_enabled: z.boolean().default(false),
  buy_me_coffee_user_key: z.string().optional(),
  share_instagram: z.boolean().default(false),
  share_facebook: z.boolean().default(false),
  share_tiktok: z.boolean().default(false),
  share_snapchat: z.boolean().default(false),
  meshcast_enabled: z.boolean().default(false),
  scheduled_at: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request.headers.get('Authorization'));
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const data = createSessionSchema.parse(body);

    // Create VDO.ninja room
    const roomId = `domino-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const vdoRoom = await vdoNinja.createRoom({
      roomId,
      maxParticipants: data.max_guests,
      password: data.is_private ? `pw-${Math.random().toString(36).slice(2, 10)}` : undefined,
    });

    // Optional: Meshcast CDN URL for large rooms
    const meshcastUrl = data.meshcast_enabled ? getMeshcastUrl(roomId) : null;

    // Insert into live_sessions
    const result = await db.query(
      `INSERT INTO live_sessions (
        host_user_id, series_id, title, description,
        session_type, is_private, max_guests,
        vdo_room_id, vdo_host_url, vdo_guest_url,
        meshcast_url,
        share_instagram, share_facebook, share_tiktok, share_snapchat,
        direct_payments_enabled, buy_me_coffee_enabled, buy_me_coffee_user_key,
        scheduled_at, is_active
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,true)
       RETURNING *`,
      [
        auth.userId,
        data.series_id || null,
        data.title,
        data.description || null,
        data.session_type,
        data.is_private,
        data.max_guests,
        roomId,
        vdoRoom.host_url,
        vdoRoom.guest_url,
        meshcastUrl,
        data.share_instagram,
        data.share_facebook,
        data.share_tiktok,
        data.share_snapchat,
        data.direct_payments_enabled,
        data.buy_me_coffee_enabled,
        data.buy_me_coffee_user_key || null,
        data.scheduled_at || null,
      ]
    );

    const session = result.rows[0];

    await db.recordAuditLog({
      user_id: auth.userId,
      action: 'create_live_session',
      resource_type: 'live_session',
      resource_id: session.id as string,
      metadata: { title: data.title, session_type: data.session_type, max_guests: data.max_guests },
    });

    return NextResponse.json({
      success: true,
      session,
      vdo_room: {
        host_url: vdoRoom.host_url,
        guest_url: vdoRoom.guest_url,
        room_id: roomId,
        meshcast_url: meshcastUrl,
      },
    });
  } catch (error: any) {
    console.error('Create live session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request.headers.get('Authorization'));
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const result = await db.query(
      `SELECT ls.*,
              COUNT(lsg.id) AS current_guests
       FROM live_sessions ls
       LEFT JOIN live_session_guests lsg ON lsg.session_id = ls.id AND lsg.left_at IS NULL
       WHERE ls.host_user_id = $1
       ${activeOnly ? 'AND ls.is_active = true' : ''}
       GROUP BY ls.id
       ORDER BY ls.created_at DESC
       LIMIT 20`,
      [auth.userId]
    );

    return NextResponse.json({ sessions: result.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request.headers.get('Authorization'));
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action } = body;

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Verify ownership
    const check = await db.query(
      `SELECT id FROM live_sessions WHERE id = $1 AND host_user_id = $2`,
      [id, auth.userId]
    );
    if (check.rows.length === 0) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (action === 'end') {
      await db.query(
        `UPDATE live_sessions SET is_active = false, ended_at = NOW() WHERE id = $1`,
        [id]
      );
      // Mark all guests as left
      await db.query(
        `UPDATE live_session_guests SET left_at = NOW() WHERE session_id = $1 AND left_at IS NULL`,
        [id]
      );
    } else if (action === 'start') {
      await db.query(
        `UPDATE live_sessions SET is_active = true, started_at = NOW() WHERE id = $1`,
        [id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
