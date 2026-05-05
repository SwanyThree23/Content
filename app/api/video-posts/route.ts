import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  series_id: z.string().uuid().optional(),
  is_paywalled: z.boolean().default(false),
  paywall_price_cents: z.number().int().min(0).max(10000).default(0),
  duration_seconds: z.number().int().min(1).max(600).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request.headers.get('Authorization'));
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const seriesId = searchParams.get('series_id');

  let query = `SELECT * FROM video_posts WHERE creator_user_id = $1`;
  const params: (string | null)[] = [auth.userId];

  if (status) {
    query += ` AND status = $${params.length + 1}`;
    params.push(status);
  }
  if (seriesId) {
    query += ` AND series_id = $${params.length + 1}`;
    params.push(seriesId);
  }

  query += ' ORDER BY created_at DESC LIMIT 50';

  const result = await db.query(query, params);
  return NextResponse.json({ posts: result.rows });
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request.headers.get('Authorization'));
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, description, series_id, is_paywalled, paywall_price_cents, duration_seconds } =
      createPostSchema.parse(body);

    const result = await db.query(
      `INSERT INTO video_posts (creator_user_id, series_id, title, description, is_paywalled, paywall_price_cents, duration_seconds, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
       RETURNING *`,
      [auth.userId, series_id || null, title, description || null, is_paywalled, paywall_price_cents, duration_seconds || null]
    );

    return NextResponse.json({ success: true, post: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
