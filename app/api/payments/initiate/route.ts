import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { calculateFee, buildPaymentUrl } from '@/lib/payments';
import { z } from 'zod';

const initiateSchema = z.object({
  recipient_user_id: z.string().uuid(),
  payment_method_id: z.string().uuid(),
  amount_cents: z.number().int().min(100).max(100000),
  message: z.string().max(200).optional(),
  session_id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request.headers.get('Authorization'));
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { recipient_user_id, payment_method_id, amount_cents, message, session_id } =
      initiateSchema.parse(body);

    // Verify payment method belongs to recipient
    const methodResult = await db.query(
      `SELECT * FROM payment_methods WHERE id = $1 AND user_id = $2 AND is_active = true`,
      [payment_method_id, recipient_user_id]
    );
    if (methodResult.rows.length === 0) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }
    const method = methodResult.rows[0];

    const fee = calculateFee(amount_cents);
    const paymentUrl = buildPaymentUrl(method, amount_cents, message);

    // Record transaction
    const txResult = await db.query(
      `INSERT INTO payment_transactions
       (sender_user_id, recipient_user_id, payment_method_id, amount_cents, platform_fee_cents, creator_receives_cents, message, session_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'initiated')
       RETURNING id`,
      [
        auth.userId,
        recipient_user_id,
        payment_method_id,
        fee.amount_cents,
        fee.platform_fee_cents,
        fee.creator_receives_cents,
        message || null,
        session_id || null,
      ]
    );

    await db.recordAuditLog({
      user_id: auth.userId,
      action: 'initiate_payment',
      resource_type: 'payment_transaction',
      resource_id: txResult.rows[0].id,
      metadata: { amount_cents, method_type: method.method_type },
    });

    return NextResponse.json({
      success: true,
      transaction_id: txResult.rows[0].id,
      payment_url: paymentUrl,
      fee_breakdown: fee,
    });
  } catch (error: any) {
    console.error('Payment initiate error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
