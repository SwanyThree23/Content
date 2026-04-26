import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateEpisodeScript } from '@/lib/ai/claude';
import { z } from 'zod';

const generateEpisodeSchema = z.object({
  series_id: z.string().uuid(),
  episode_number: z.number().int().positive(),
  target_duration: z.number().optional().default(3),
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
    const { series_id, episode_number, target_duration } =
      generateEpisodeSchema.parse(body);

    // Get series details
    const series = await db.getSeriesById(series_id);
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    // Verify ownership
    if (series.user_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get previous episode for context
    const previousEpisodes = await db.getEpisodesBySeriesId(series_id);
    const previousEpisode = previousEpisodes.find(
      e => e.episode_number === episode_number - 1
    );

    // Generate script using Claude
    const script = await generateEpisodeScript({
      seriesTitle: series.title,
      genre: series.genre || 'Drama',
      tone: series.tone || 'Dramatic',
      episodeNumber: episode_number,
      previousSummary: previousEpisode?.synopsis || undefined,
      characters: [], // TODO: Fetch from characters table
      targetDuration: target_duration,
    });

    // Create episode
    const episode = await db.createEpisode({
      series_id,
      episode_number,
      title: script.title,
      synopsis: script.synopsis,
      script: JSON.stringify(script),
    });

    // Create scenes
    for (const scene of script.scenes) {
      await db.createScene({
        episode_id: episode.id,
        scene_number: scene.sceneNumber,
        location: scene.location,
        description: scene.description,
        dialogue: scene.dialogue,
      });
    }

    await db.recordAuditLog({
      user_id: auth.userId,
      action: 'generate_episode',
      resource_type: 'episode',
      resource_id: episode.id,
      metadata: { series_id, episode_number },
    });

    return NextResponse.json({
      success: true,
      episode: {
        id: episode.id,
        title: episode.title,
        synopsis: episode.synopsis,
        scenes: script.scenes,
      },
    });

  } catch (error: any) {
    console.error('Generate episode error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate episode' },
      { status: 500 }
    );
  }
}
