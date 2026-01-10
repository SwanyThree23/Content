import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createSeriesSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  genre: z.string().optional(),
  tone: z.string().optional(),
  target_audience: z.string().optional(),
});

// GET /api/series - List all series for user
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(
      request.headers.get('Authorization')
    );

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const series = await db.getSeriesByUserId(auth.userId);

    return NextResponse.json({ series });

  } catch (error: any) {
    console.error('Get series error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}

// POST /api/series - Create new series
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(
      request.headers.get('Authorization')
    );

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createSeriesSchema.parse(body);

    const series = await db.createSeries({
      user_id: auth.userId,
      ...data,
    });

    await db.recordAuditLog({
      user_id: auth.userId,
      action: 'create_series',
      resource_type: 'series',
      resource_id: series.id,
      metadata: { title: series.title },
    });

    return NextResponse.json({ series });

  } catch (error: any) {
    console.error('Create series error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create series' },
      { status: 400 }
    );
  }
}
