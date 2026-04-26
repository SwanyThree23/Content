import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { uploadVideo } from '@/lib/youtube/client';
import { z } from 'zod';

const uploadSchema = z.object({
  episode_id: z.string().uuid(),
  privacy_status: z.enum(['private', 'unlisted', 'public']).optional(),
  scheduled_publish_at: z.string().optional(),
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
    const { episode_id, privacy_status, scheduled_publish_at } =
      uploadSchema.parse(body);

    // Get episode
    const episode = await db.getEpisodeById(episode_id);
    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    // Get series
    const series = await db.getSeriesById(episode.series_id);
    if (!series || series.user_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if video URL exists
    if (!episode.youtube_video_id) {
      return NextResponse.json(
        { error: 'Episode video not ready' },
        { status: 400 }
      );
    }

    // Get YouTube credentials (from youtube_channels table)
    // This is simplified - in production, fetch actual credentials
    const credentials = {
      access_token: process.env.YOUTUBE_ACCESS_TOKEN || '',
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN || '',
    };

    // Generate description
    const description = `${episode.synopsis}\n\n${series.title} - Episode ${episode.episode_number}\n\n#SoapOpera #Drama #${series.genre}`;

    // Upload to YouTube
    const result = await uploadVideo(credentials, {
      title: `${series.title} - Episode ${episode.episode_number}: ${episode.title}`,
      description,
      tags: [series.title, 'soap opera', series.genre || 'drama'],
      privacyStatus: privacy_status || 'private',
      scheduledPublishAt: scheduled_publish_at
        ? new Date(scheduled_publish_at)
        : undefined,
      filePath: '/tmp/episode-video.mp4', // TODO: Actual file path
    });

    // Update episode with YouTube details
    await db.updateEpisodeStatus(episode_id, 'published');

    await db.recordAuditLog({
      user_id: auth.userId,
      action: 'upload_youtube',
      resource_type: 'episode',
      resource_id: episode_id,
      metadata: { youtube_video_id: result.videoId },
    });

    return NextResponse.json({
      success: true,
      youtube_url: result.url,
      video_id: result.videoId,
    });

  } catch (error: any) {
    console.error('YouTube upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload to YouTube' },
      { status: 500 }
    );
  }
}
