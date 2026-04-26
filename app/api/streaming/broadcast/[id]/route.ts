import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(
      request.headers.get('Authorization')
    );

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = params.id;

    // Get broadcast session
    const [session] = await db.sql`
      SELECT * FROM broadcast_sessions
      WHERE id = ${sessionId}
    `;

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get episode to verify ownership
    const episode = await db.getEpisodeById(session.episode_id);
    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    const series = await db.getSeriesById(episode.series_id);
    if (!series || series.user_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get web sources
    const webSources = await db.sql`
      SELECT * FROM web_sources
      WHERE broadcast_session_id = ${sessionId}
      ORDER BY z_index ASC
    `;

    // Get destinations
    const destinations = await db.sql`
      SELECT * FROM stream_destinations
      WHERE broadcast_session_id = ${sessionId}
      ORDER BY created_at ASC
    `;

    // Get recent metrics
    const metrics = await db.sql`
      SELECT * FROM stream_metrics
      WHERE broadcast_session_id = ${sessionId}
      ORDER BY timestamp DESC
      LIMIT 100
    `;

    return NextResponse.json({
      session,
      webSources,
      destinations,
      metrics,
    });

  } catch (error: any) {
    console.error('Get broadcast error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get broadcast' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(
      request.headers.get('Authorization')
    );

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = params.id;
    const body = await request.json();
    const { status } = body;

    // Update session
    const [session] = await db.sql`
      UPDATE broadcast_sessions
      SET
        status = COALESCE(${status}, status),
        started_at = CASE WHEN ${status} = 'live' AND started_at IS NULL THEN NOW() ELSE started_at END,
        ended_at = CASE WHEN ${status} = 'ended' THEN NOW() ELSE ended_at END,
        duration_seconds = CASE WHEN ${status} = 'ended' THEN EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER ELSE duration_seconds END,
        updated_at = NOW()
      WHERE id = ${sessionId}
      RETURNING *
    `;

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session });

  } catch (error: any) {
    console.error('Update broadcast error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update broadcast' },
      { status: 500 }
    );
  }
}
