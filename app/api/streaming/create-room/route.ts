import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { vdoNinja } from '@/lib/streaming/vdo-ninja';
import { db } from '@/lib/db';
import { z } from 'zod';

const createRoomSchema = z.object({
  episode_id: z.string().uuid(),
  scene_number: z.number().int().positive(),
  actors: z.array(z.object({
    name: z.string(),
    character: z.string(),
  })),
  quality: z.enum(['low', 'medium', 'high', 'ultra']).optional().default('high'),
  password: z.string().optional(),
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
    const { episode_id, scene_number, actors, quality, password } =
      createRoomSchema.parse(body);

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

    // Generate room ID
    const roomId = `${series.title.replace(/\s+/g, '')}_E${episode.episode_number}_S${scene_number}`;
    const roomPassword = password || Math.random().toString(36).substring(7);

    // Create VDO.ninja room configuration
    const multiCam = vdoNinja.createMultiCamera(roomId, actors, {
      password: roomPassword,
    });

    // Create recording session in database
    const [session] = await db.sql`
      INSERT INTO recording_sessions (
        episode_id,
        room_id,
        room_password,
        status,
        director_url,
        view_url,
        quality_preset,
        metadata
      ) VALUES (
        ${episode_id},
        ${roomId},
        ${roomPassword},
        'setup',
        ${multiCam.directorUrl},
        ${multiCam.viewUrl},
        ${quality},
        ${JSON.stringify({ actors })}
      )
      RETURNING *
    `;

    // Create actor stream records
    for (const actorUrl of multiCam.actorUrls) {
      await db.sql`
        INSERT INTO actor_streams (
          recording_session_id,
          actor_name,
          character_name,
          stream_id,
          stream_url,
          push_url
        ) VALUES (
          ${session.id},
          ${actorUrl.actor},
          ${actorUrl.character},
          ${actorUrl.actor.replace(/\s+/g, '')},
          ${actorUrl.url},
          ${actorUrl.url}
        )
      `;
    }

    await db.recordAuditLog({
      user_id: auth.userId,
      action: 'create_recording_room',
      resource_type: 'recording_session',
      resource_id: session.id,
      metadata: { episode_id, room_id: roomId },
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        roomId,
        password: roomPassword,
        directorUrl: multiCam.directorUrl,
        viewUrl: multiCam.viewUrl,
        actorUrls: multiCam.actorUrls,
      },
    });

  } catch (error: any) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create recording room' },
      { status: 500 }
    );
  }
}
