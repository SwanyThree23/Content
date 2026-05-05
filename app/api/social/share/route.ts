import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const shareSchema = z.object({
  resource_type: z.enum(['live_session', 'video_post', 'episode', 'series']),
  resource_id: z.string().uuid(),
  platforms: z.array(z.enum(['instagram', 'facebook', 'tiktok', 'snapchat', 'youtube', 'twitter', 'copy_link'])),
  share_url: z.string().url().optional(),
});

// Build platform share URLs
function buildShareUrl(platform: string, contentUrl: string, title: string): string {
  const encoded = encodeURIComponent(contentUrl);
  const encodedTitle = encodeURIComponent(title);

  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encoded}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`;
    case 'instagram':
      return `https://www.instagram.com/`;  // Instagram requires mobile app deep link
    case 'tiktok':
      return `https://www.tiktok.com/`;     // TikTok requires app
    case 'snapchat':
      return `https://www.snapchat.com/scan?attachmentUrl=${encoded}`;
    case 'copy_link':
      return contentUrl;
    default:
      return contentUrl;
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request.headers.get('Authorization'));
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { resource_type, resource_id, platforms, share_url } = shareSchema.parse(body);

    // Get resource title for share text
    let title = 'Check this out on Domino Entertainment!';
    if (resource_type === 'episode') {
      const ep = await db.getEpisodeById(resource_id);
      if (ep) title = ep.title;
    } else if (resource_type === 'series') {
      const series = await db.getSeriesById(resource_id);
      if (series) title = series.title;
    }

    const baseUrl = share_url || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://dominoentertainment.vercel.app'}/${resource_type}/${resource_id}`;

    const shares = await Promise.all(
      platforms.map(async (platform) => {
        const platformUrl = buildShareUrl(platform, baseUrl, title);
        const result = await db.query(
          `INSERT INTO social_shares (user_id, resource_type, resource_id, platform, share_url, status)
           VALUES ($1, $2, $3, $4, $5, 'shared')
           RETURNING id`,
          [auth.userId, resource_type, resource_id, platform, platformUrl]
        );
        return { platform, share_url: platformUrl, id: result.rows[0].id };
      })
    );

    return NextResponse.json({ success: true, shares });
  } catch (error: any) {
    console.error('Social share error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create shares' },
      { status: 500 }
    );
  }
}
