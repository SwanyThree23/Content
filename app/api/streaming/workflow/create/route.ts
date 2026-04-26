import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { evmux } from '@/lib/streaming/evmux';
import { vdoNinja } from '@/lib/streaming/vdo-ninja';
import { db } from '@/lib/db';
import { z } from 'zod';

const createWorkflowSchema = z.object({
  episode_id: z.string().uuid(),
  workflow_type: z.enum(['vdo_only', 'evmux_only', 'hybrid']),
  vdo_config: z.object({
    roomId: z.string(),
    actors: z.array(z.object({
      name: z.string(),
      character: z.string(),
    })),
  }).optional(),
  evmux_config: z.object({
    rtmpUrl: z.string(),
    appId: z.string(),
    token: z.string(),
  }).optional(),
  youtube_stream_key: z.string().optional(),
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
    const { episode_id, workflow_type, vdo_config, evmux_config, youtube_stream_key } =
      createWorkflowSchema.parse(body);

    // Get episode details
    const episode = await db.getEpisodeById(episode_id);
    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    const series = await db.getSeriesById(episode.series_id);
    if (!series || series.user_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let recordingSessionId = null;
    let broadcastSessionId = null;
    let steps: any[] = [];

    // Step 1: VDO.ninja recording (if applicable)
    if (workflow_type === 'vdo_only' || workflow_type === 'hybrid') {
      if (!vdo_config) {
        return NextResponse.json(
          { error: 'VDO.ninja config required for this workflow' },
          { status: 400 }
        );
      }

      const multiCam = vdoNinja.createMultiCamera(
        vdo_config.roomId,
        vdo_config.actors,
        {}
      );

      const [recSession] = await db.sql`
        INSERT INTO recording_sessions (
          episode_id,
          room_id,
          director_url,
          view_url,
          status,
          metadata
        ) VALUES (
          ${episode_id},
          ${vdo_config.roomId},
          ${multiCam.directorUrl},
          ${multiCam.viewUrl},
          'setup',
          ${JSON.stringify({ workflow: workflow_type })}
        )
        RETURNING *
      `;

      recordingSessionId = recSession.id;

      steps.push({
        step: 1,
        name: 'VDO.ninja Recording',
        status: 'pending',
        description: 'Record scenes with live actors',
      });
    }

    // Step 2: evmux broadcast (if applicable)
    if (workflow_type === 'evmux_only' || workflow_type === 'hybrid') {
      if (!evmux_config) {
        return NextResponse.json(
          { error: 'evmux config required for this workflow' },
          { status: 400 }
        );
      }

      const broadcastSession = evmux.createBroadcastSession({
        episodeId: episode_id,
        rtmpConfig: evmux_config,
      });

      // Add YouTube destination if provided
      if (youtube_stream_key) {
        const ytDest = evmux.addYouTubeDestination(youtube_stream_key);
        broadcastSession.destinations.push(ytDest);
      }

      // Add web sources (title, branding)
      const titleSource = evmux.templates.soapOperaTitle(
        series.title,
        episode.episode_number
      );
      broadcastSession.webSources.push(titleSource);

      const [bcastSession] = await db.sql`
        INSERT INTO broadcast_sessions (
          episode_id,
          recording_session_id,
          stream_id,
          rtmp_url,
          stream_key,
          status,
          metadata
        ) VALUES (
          ${episode_id},
          ${recordingSessionId},
          ${broadcastSession.streamId},
          ${broadcastSession.rtmpUrl},
          ${broadcastSession.streamKey},
          'setup',
          ${JSON.stringify({ workflow: workflow_type })}
        )
        RETURNING *
      `;

      broadcastSessionId = bcastSession.id;

      // Save web sources
      for (const source of broadcastSession.webSources) {
        await db.sql`
          INSERT INTO web_sources (
            broadcast_session_id,
            name,
            url,
            type,
            width,
            height,
            is_enabled
          ) VALUES (
            ${bcastSession.id},
            ${source.name},
            ${source.url},
            ${source.type},
            ${source.width},
            ${source.height},
            ${source.enabled}
          )
        `;
      }

      // Save destinations
      for (const dest of broadcastSession.destinations) {
        await db.sql`
          INSERT INTO stream_destinations (
            broadcast_session_id,
            platform,
            rtmp_url,
            stream_key,
            is_enabled
          ) VALUES (
            ${bcastSession.id},
            ${dest.platform},
            ${dest.rtmpUrl},
            ${dest.streamKey},
            ${dest.enabled}
          )
        `;
      }

      steps.push({
        step: workflow_type === 'hybrid' ? 2 : 1,
        name: 'evmux Broadcast',
        status: 'pending',
        description: 'Professional RTMP streaming with overlays',
      });
    }

    // Step 3: YouTube publish
    steps.push({
      step: steps.length + 1,
      name: 'YouTube Publish',
      status: 'pending',
      description: 'Publish final episode to YouTube',
    });

    // Create production workflow
    const [workflow] = await db.sql`
      INSERT INTO production_workflows (
        episode_id,
        recording_session_id,
        broadcast_session_id,
        workflow_type,
        status,
        steps,
        current_step,
        total_steps,
        metadata
      ) VALUES (
        ${episode_id},
        ${recordingSessionId},
        ${broadcastSessionId},
        ${workflow_type},
        'setup',
        ${JSON.stringify(steps)},
        1,
        ${steps.length},
        ${JSON.stringify({ created_by: auth.userId })}
      )
      RETURNING *
    `;

    await db.recordAuditLog({
      user_id: auth.userId,
      action: 'create_production_workflow',
      resource_type: 'production_workflow',
      resource_id: workflow.id,
      metadata: { episode_id, workflow_type },
    });

    return NextResponse.json({
      success: true,
      workflow: {
        id: workflow.id,
        type: workflow_type,
        steps,
        recordingSessionId,
        broadcastSessionId,
      },
    });

  } catch (error: any) {
    console.error('Create workflow error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create workflow' },
      { status: 500 }
    );
  }
}
