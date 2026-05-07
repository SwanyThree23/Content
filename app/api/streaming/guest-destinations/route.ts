// evmux Guest Destinations
// Guests can stream from your evmux session to their own YouTube/Twitch channels

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const destinationSchema = z.object({
  session_id: z.string(),
  guest_name: z.string().min(1).max(100),
  destination_type: z.enum(['youtube', 'twitch', 'facebook', 'custom_rtmp']),
  rtmp_url: z.string().url().optional(),
  stream_key: z.string().optional(),
  youtube_channel_id: z.string().optional(),
  twitch_channel: z.string().optional(),
});

// Build evmux guest destination configuration
function buildGuestDestination(
  data: z.infer<typeof destinationSchema>
): {
  evmux_config: Record<string, unknown>;
  guest_url: string;
  instructions: string[];
} {
  const baseGuestUrl = `https://console.evmux.com/guest/9ql-0vvq-hsm`;

  const rtmpMap: Record<string, string> = {
    youtube: 'rtmp://a.rtmp.youtube.com/live2',
    twitch: 'rtmp://live.twitch.tv/app',
    facebook: 'rtmps://live-api-s.facebook.com:443/rtmp/',
    custom_rtmp: data.rtmp_url || '',
  };

  const rtmpUrl = rtmpMap[data.destination_type];

  const evmux_config = {
    type: 'guest_destination',
    guest_name: data.guest_name,
    output: {
      protocol: 'rtmp',
      url: rtmpUrl,
      stream_key: data.stream_key || '',
    },
    source: {
      type: 'evmux_guest',
      session_id: data.session_id,
    },
  };

  const instructions: Record<string, string[]> = {
    youtube: [
      `1. Go to YouTube Studio → Go Live`,
      `2. Copy your Stream Key from YouTube`,
      `3. Paste the stream key in evmux Guest Destinations`,
      `4. Your guest feed will appear on your YouTube channel`,
    ],
    twitch: [
      `1. Go to Twitch → Creator Dashboard → Stream`,
      `2. Copy your Primary Stream Key`,
      `3. Paste into evmux Guest Destinations`,
      `4. You'll go live on your own Twitch simultaneously`,
    ],
    facebook: [
      `1. Go to Facebook → Live Producer`,
      `2. Copy the Stream Key`,
      `3. Set RTMP URL to: rtmps://live-api-s.facebook.com:443/rtmp/`,
      `4. Your guest feed streams to your Facebook Page`,
    ],
    custom_rtmp: [
      `1. Enter your RTMP ingest URL`,
      `2. Enter your stream key`,
      `3. Connect to broadcast on your platform`,
    ],
  };

  return {
    evmux_config,
    guest_url: baseGuestUrl,
    instructions: instructions[data.destination_type] || [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request.headers.get('Authorization'));
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const data = destinationSchema.parse(body);

    const config = buildGuestDestination(data);

    // Store guest destination config
    await db.query(
      `INSERT INTO stream_destinations (session_id, name, platform, rtmp_url, stream_key, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT DO NOTHING`,
      [
        data.session_id,
        data.guest_name,
        data.destination_type,
        config.evmux_config.output && (config.evmux_config.output as Record<string,string>).url || null,
        data.stream_key || null,
      ]
    );

    await db.recordAuditLog({
      user_id: auth.userId,
      action: 'create_guest_destination',
      resource_type: 'live_session',
      resource_id: data.session_id,
      metadata: { guest_name: data.guest_name, destination_type: data.destination_type },
    });

    return NextResponse.json({
      success: true,
      guest_url: config.guest_url,
      evmux_config: config.evmux_config,
      instructions: config.instructions,
      message: `Guest destination configured for ${data.guest_name} → ${data.destination_type}`,
    });
  } catch (error: any) {
    console.error('Guest destination error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to configure guest destination' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request.headers.get('Authorization'));
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });

  const result = await db.query(
    `SELECT * FROM stream_destinations WHERE session_id = $1 ORDER BY created_at DESC`,
    [sessionId]
  );

  return NextResponse.json({ destinations: result.rows });
}
