import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateEpisodeVideos } from '@/lib/ai/veo3';
import { z } from 'zod';

const generateVideosSchema = z.object({
  episode_id: z.string().uuid(),
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
    const { episode_id } = generateVideosSchema.parse(body);

    // Get episode
    const episode = await db.getEpisodeById(episode_id);
    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    // Get series to verify ownership
    const series = await db.getSeriesById(episode.series_id);
    if (!series || series.user_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get scenes
    const scenes = await db.getScenesByEpisodeId(episode_id);
    if (scenes.length === 0) {
      return NextResponse.json(
        { error: 'No scenes found for episode' },
        { status: 400 }
      );
    }

    // Parse script to get visual prompts
    const script = episode.script ? JSON.parse(episode.script) : null;
    if (!script || !script.scenes) {
      return NextResponse.json(
        { error: 'Invalid episode script' },
        { status: 400 }
      );
    }

    // Prepare scenes for video generation
    const sceneData = script.scenes.map((s: any) => ({
      sceneNumber: s.sceneNumber,
      visualPrompt: s.visualPrompt,
      duration: s.estimatedDuration || 30,
    }));

    // Generate videos using Veo 3
    const results = await generateEpisodeVideos(sceneData);

    // Update episode status
    await db.updateEpisodeStatus(episode_id, 'processing');

    await db.recordAuditLog({
      user_id: auth.userId,
      action: 'generate_videos',
      resource_type: 'episode',
      resource_id: episode_id,
      metadata: { scene_count: scenes.length },
    });

    return NextResponse.json({
      success: true,
      message: 'Video generation started',
      jobs: Array.from(results.entries()).map(([sceneNum, result]) => ({
        sceneNumber: sceneNum,
        jobId: result.jobId,
        status: result.status,
      })),
    });

  } catch (error: any) {
    console.error('Generate videos error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate videos' },
      { status: 500 }
    );
  }
}
