import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { evmux } from '@/lib/streaming/evmux';
import { db } from '@/lib/db';
import { z } from 'zod';

const createBroadcastSchema = z.object({
  episode_id: z.string().uuid(),
  recording_session_id: z.string().uuid().optional(),
  quality: z.enum(['1080p60', '1080p30', '720p60', '720p30']).optional().default('1080p30'),
  evmux_config: z.object({
    rtmpUrl: z.string(),
    appId: z.string(),
    token: z.string(),
  }),
  destinations: z.array(z.object({
    platform: z.enum(['youtube', 'twitch', 'facebook', 'custom']),
    rtmpUrl: z.string(),
    streamKey: z.string(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(
      request.headers.get('Authorization')
    );

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { episode_id, recording_session_id, quality, evmux_config, destinations } =
      createBroadcastSchema.parse(body);

    // Get episode details
    const episode = await db.getEpisodeById(episode_id);
    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    // Verify ownership
    const series = await db.getSeriesById(episode.series_id);
    if (!series || series.user_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create broadcast session
    const broadcastSession = evmux.createBroadcastSession({
      episodeId: episode_id,
      rtmpConfig: evmux_config,
      destinations,
    });

    // Save to database
    const [session] = await db.sql`
      INSERT INTO broadcast_sessions (
        episode_id,
        recording_session_id,
        stream_id,
        rtmp_url,
        stream_key,
        status,
        quality_preset,
        metadata
      ) VALUES (
        ${episode_id},
        ${recording_session_id || null},
        ${broadcastSession.streamId},
        ${broadcastSession.rtmpUrl},
        ${broadcastSession.streamKey},
        'setup',
        ${quality},
        ${JSON.stringify({ created_by: auth.userId })}
      )
      RETURNING *
    `;

    // Add web sources if they exist
    for (const source of broadcastSession.webSources) {
      await db.sql`
        INSERT INTO web_sources (
          broadcast_session_id,
          name,
          url,
          type,
          width,
          height,
          position_x,
          position_y,
          z_index,
          is_enabled
        ) VALUES (
          ${session.id},
          ${source.name},
          ${source.url},
          ${source.type},
          ${source.width},
          ${source.height},
          ${source.position?.x || 0},
          ${source.position?.y || 0},
          ${source.zIndex || 10},
          ${source.enabled}
        )
      `;
    }

    // Add stream destinations
    for (const dest of broadcastSession.destinations) {
      await db.sql`
        INSERT INTO stream_destinations (
          broadcast_session_id,
          platform,
          rtmp_url,
          stream_key,
          is_enabled
        ) VALUES (
          ${session.id},
          ${dest.platform},
          ${dest.rtmpUrl},
          ${dest.streamKey},
          ${dest.enabled}
        )
      `;
    }

    await db.recordAuditLog({
      user_id: auth.userId,
      action: 'create_broadcast',
      resource_type: 'broadcast_session',
      resource_id: session.id,
      metadata: { episode_id, quality },
    });

    // Get complete RTMP URL
    const rtmpUrl = evmux.getRTMPUrl({
      id: session.stream_id,
      url: session.rtmp_url,
      streamKey: session.stream_key,
      status: 'idle',
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        streamId: session.stream_id,
        rtmpUrl,
        status: session.status,
        quality: quality,
      },
    });

  } catch (error: any) {
    console.error('Create broadcast error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create broadcast' },
      { status: 500 }
    );
  }
}
