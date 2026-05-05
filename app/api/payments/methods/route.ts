import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const addMethodSchema = z.object({
  method_type: z.enum(['paypal', 'cashapp', 'venmo', 'zelle', 'chime']),
  handle: z.string().min(1).max(200),
  display_name: z.string().max(100).optional(),
  is_primary: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request.headers.get('Authorization'));
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const methods = await db.query(
    `SELECT * FROM payment_methods WHERE user_id = $1 AND is_active = true ORDER BY is_primary DESC, created_at ASC`,
    [auth.userId]
  );

  return NextResponse.json({ methods: methods.rows });
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request.headers.get('Authorization'));
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { method_type, handle, display_name, is_primary } = addMethodSchema.parse(body);

  if (is_primary) {
    await db.query(
      `UPDATE payment_methods SET is_primary = false WHERE user_id = $1`,
      [auth.userId]
    );
  }

  const result = await db.query(
    `INSERT INTO payment_methods (user_id, method_type, handle, display_name, is_primary)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, method_type)
     DO UPDATE SET handle = $3, display_name = $4, is_primary = $5, updated_at = NOW()
     RETURNING *`,
    [auth.userId, method_type, handle, display_name || null, is_primary || false]
  );

  return NextResponse.json({ success: true, method: result.rows[0] });
}

export async function DELETE(request: NextRequest) {
  const auth = await authenticateRequest(request.headers.get('Authorization'));
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const methodId = searchParams.get('id');
  if (!methodId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await db.query(
    `UPDATE payment_methods SET is_active = false WHERE id = $1 AND user_id = $2`,
    [methodId, auth.userId]
  );

  return NextResponse.json({ success: true });
}
