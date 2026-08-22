import { NextResponse } from 'next/server';
import { db } from '@/src/lib/neon';
import { isSuccessfulTransaction, verifyMidtransSignature, type MidtransNotification } from '@/src/lib/midtrans';

export async function POST(req: Request) {
  const notification = await req.json() as MidtransNotification & { transaction_id?: string };
  if (!verifyMidtransSignature(notification) || notification.status_code !== '200' || (notification.fraud_status && notification.fraud_status.toLowerCase() !== 'accept' && isSuccessfulTransaction(notification))) return NextResponse.json({ error: 'Invalid notification' }, { status: 400 });
  const sql = db();
  const eventKey = notification.transaction_id || notification.order_id;
  const inserted = await sql`INSERT INTO webhook_events(provider,external_event_id,payload,processed) VALUES('midtrans',${eventKey},${JSON.stringify(notification)}::jsonb,false) ON CONFLICT(provider,external_event_id) DO NOTHING RETURNING id`;
  if (!inserted.length) return NextResponse.json({ ok: true, duplicate: true });

  const orders = await sql`SELECT o.id,o.user_id,o.amount_idr,p.id AS pass_id,p.duration_hours,e.id AS event_id,e.ends_at FROM orders o JOIN passes p ON p.id=o.pass_id JOIN events e ON e.id=p.event_id WHERE o.external_order_id=${notification.order_id} LIMIT 1`;
  const order = orders[0];
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (Number(order.amount_idr).toFixed(2) !== Number(notification.gross_amount).toFixed(2)) return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });

  if (isSuccessfulTransaction(notification)) {
    await sql`UPDATE orders SET status='paid',paid_at=now() WHERE id=${order.id}::uuid AND status <> 'paid'`;
    const expires = order.ends_at ? new Date(order.ends_at) : new Date(Date.now() + Number(order.duration_hours || 24) * 3600000);
    await sql`INSERT INTO entitlements(user_id,event_id,pass_id,starts_at,expires_at,source_order_id) VALUES(${order.user_id},${order.event_id},${order.pass_id},now(),${expires.toISOString()},${order.id}::uuid) ON CONFLICT(source_order_id) DO NOTHING`;
  } else if (['deny','cancel','cancelled','expire','expired'].includes(notification.transaction_status)) {
    await sql`UPDATE orders SET status='failed' WHERE id=${order.id}::uuid AND status='pending'`;
  }
  await sql`UPDATE webhook_events SET processed=true WHERE id=${inserted[0].id}`;
  return NextResponse.json({ ok: true });
}
