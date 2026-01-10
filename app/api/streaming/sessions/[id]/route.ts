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

    // Get recording session
    const [session] = await db.sql`
      SELECT * FROM recording_sessions
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

    // Get actor streams
    const actorStreams = await db.sql`
      SELECT * FROM actor_streams
      WHERE recording_session_id = ${sessionId}
      ORDER BY created_at ASC
    `;

    // Get recording files
    const files = await db.sql`
      SELECT * FROM recording_files
      WHERE recording_session_id = ${sessionId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      session,
      actors: actorStreams,
      files,
    });

  } catch (error: any) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get session' },
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
    const { status, recording_url } = body;

    // Update session
    const [session] = await db.sql`
      UPDATE recording_sessions
      SET
        status = COALESCE(${status}, status),
        recording_url = COALESCE(${recording_url}, recording_url),
        started_at = CASE WHEN ${status} = 'recording' AND started_at IS NULL THEN NOW() ELSE started_at END,
        completed_at = CASE WHEN ${status} = 'completed' THEN NOW() ELSE completed_at END,
        updated_at = NOW()
      WHERE id = ${sessionId}
      RETURNING *
    `;

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session });

  } catch (error: any) {
    console.error('Update session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update session' },
      { status: 500 }
    );
  }
}
