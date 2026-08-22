import { NextResponse } from 'next/server';
import { db } from '@/src/lib/neon';
import { isSuccessfulTransaction, verifyMidtransSignature, type MidtransNotification } from '@/src/lib/midtrans';

const FAILED_STATUSES = new Set(['deny', 'cancel', 'cancelled', 'expire', 'expired', 'failure']);

export async function POST(req: Request) {
  let notification: MidtransNotification & { transaction_id?: string };

  try {
    notification = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid notification body' }, { status: 400 });
  }

  if (!notification?.order_id || !notification?.status_code || !notification?.gross_amount || !notification?.signature_key || !notification?.transaction_status) {
    return NextResponse.json({ error: 'Incomplete notification' }, { status: 400 });
  }

  if (notification.status_code !== '200' || !verifyMidtransSignature(notification)) {
    return NextResponse.json({ error: 'Invalid notification' }, { status: 400 });
  }

  const sql = db();
  const transactionStatus = notification.transaction_status.toLowerCase();
  const fraudStatus = notification.fraud_status?.toLowerCase();

  // A capture is only successful when Midtrans has accepted it. Settlement is
  // successful regardless of an omitted fraud_status field.
  if (transactionStatus === 'capture' && fraudStatus === 'deny') {
    return NextResponse.json({ error: 'Transaction denied by fraud check' }, { status: 400 });
  }

  const orders = await sql`
    SELECT
      o.id,
      o.user_id,
      o.amount_idr,
      o.status AS order_status,
      p.id AS pass_id,
      p.duration_hours,
      e.id AS event_id,
      e.ends_at
    FROM orders o
    JOIN passes p ON p.id = o.pass_id
    JOIN events e ON e.id = p.event_id
    WHERE o.external_order_id = ${notification.order_id}
    LIMIT 1
  `;
  const order = orders[0];

  // Return 404 so Midtrans can retry if our database has not caught up yet.
  // Do not create a webhook_events row before the order is found.
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (Number(order.amount_idr).toFixed(2) !== Number(notification.gross_amount).toFixed(2)) {
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
  }

  // One transaction can produce multiple notifications (pending -> settlement,
  // etc.). transaction_id alone is therefore NOT a safe idempotency key.
  const eventKey = [
    notification.transaction_id || notification.order_id,
    notification.status_code,
    transactionStatus,
    notification.gross_amount,
  ].join(':');

  const inserted = await sql`
    INSERT INTO webhook_events(
      provider,
      external_event_id,
      payload,
      processed
    )
    VALUES(
      'midtrans',
      ${eventKey},
      ${JSON.stringify(notification)}::jsonb,
      false
    )
    ON CONFLICT(provider, external_event_id) DO NOTHING
    RETURNING id
  `;

  if (!inserted.length) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  if (isSuccessfulTransaction(notification)) {
    // Never downgrade an already-paid order.
    await sql`
      UPDATE orders
      SET status = 'paid', paid_at = COALESCE(paid_at, now())
      WHERE id = ${order.id}::uuid
        AND status <> 'paid'
    `;

    const expires = order.ends_at
      ? new Date(order.ends_at)
      : new Date(Date.now() + Number(order.duration_hours || 24) * 3600000);

    // source_order_id is UNIQUE, making entitlement creation idempotent even if
    // Midtrans retries the same successful notification.
    await sql`
      INSERT INTO entitlements(
        user_id,
        event_id,
        pass_id,
        starts_at,
        expires_at,
        source_order_id
      )
      VALUES(
        ${order.user_id},
        ${order.event_id},
        ${order.pass_id},
        now(),
        ${expires.toISOString()},
        ${order.id}::uuid
      )
      ON CONFLICT(source_order_id) DO NOTHING
    `;
  } else if (FAILED_STATUSES.has(transactionStatus)) {
    // A failed notification must never overwrite a successful payment.
    await sql`
      UPDATE orders
      SET status = 'failed'
      WHERE id = ${order.id}::uuid
        AND status = 'pending'
    `;
  }

  await sql`
    UPDATE webhook_events
    SET processed = true
    WHERE id = ${inserted[0].id}
  `;

  return NextResponse.json({ ok: true });
}
