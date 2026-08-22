import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { db } from '@/src/lib/neon';
import { getSessionUser } from '@/src/lib/auth';
import { createSnapTransaction } from '@/src/lib/midtrans';

const PLANS = { daily: 'DAILY', full: 'FULL' } as const;

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const plan = (body as { plan?: unknown })?.plan;
  if (plan !== 'daily' && plan !== 'full') {
    return NextResponse.json({ error: 'Invalid pass' }, { status: 400 });
  }

  const sql = db();
  const eventSlug = process.env.RUMGIP_EVENT_SLUG || 'rumgip-championship-v4';
  const rows = await sql`
    SELECT p.id, p.price_idr, p.name, e.id AS event_id
    FROM passes p
    JOIN events e ON e.id = p.event_id
    WHERE e.slug = ${eventSlug}
      AND p.code = ${PLANS[plan]}
      AND p.active = true
    LIMIT 1
  `;
  const pass = rows[0];

  if (!pass) {
    return NextResponse.json({ error: 'Pass is not configured' }, { status: 409 });
  }

  const externalOrderId = `RUMGIP-${crypto.randomUUID()}`;
  const orders = await sql`
    INSERT INTO orders(user_id, pass_id, external_order_id, amount_idr)
    VALUES(${user.id}, ${pass.id}, ${externalOrderId}, ${pass.price_idr})
    RETURNING id
  `;

  try {
    const snap = await createSnapTransaction(
      externalOrderId,
      Number(pass.price_idr),
      { first_name: user.name || 'RUMGIP Fan', email: user.email },
    );

    return NextResponse.json({
      orderId: orders[0].id,
      token: snap.token,
      redirectUrl: snap.redirect_url,
    });
  } catch (error) {
    console.error('Midtrans checkout creation failed', {
      orderId: orders[0].id,
      externalOrderId,
      error,
    });

    return NextResponse.json(
      { error: 'Unable to create payment. Please try again.' },
      { status: 502 },
    );
  }
}
