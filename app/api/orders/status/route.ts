import { NextResponse } from 'next/server';
import { db } from '@/src/lib/neon';
import { getSessionUser } from '@/src/lib/auth';

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const orderId = new URL(req.url).searchParams.get('order_id');
  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });

  const sql = db();
  const rows = await sql`
    SELECT o.id, o.external_order_id, o.status, o.paid_at,
           EXISTS(SELECT 1 FROM entitlements e WHERE e.source_order_id = o.id) AS entitled
    FROM orders o
    WHERE o.id=${orderId}::uuid AND o.user_id=${user.id}
    LIMIT 1
  `;
  if (!rows.length) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const order = rows[0];
  return NextResponse.json({
    orderId: order.id,
    externalOrderId: order.external_order_id,
    status: order.status,
    paidAt: order.paid_at,
    entitled: Boolean(order.entitled),
  });
}
