import crypto from 'node:crypto';
import { db } from '@/src/lib/neon';
import { createSnapTransaction } from '@/src/lib/midtrans';

export type CheckoutPlan = 'daily' | 'full';

const PASS_CODES: Record<CheckoutPlan, 'DAILY' | 'FULL'> = {
  daily: 'DAILY',
  full: 'FULL',
};

export async function createCheckoutOrder(
  user: { id: string; name?: string | null; email: string },
  plan: CheckoutPlan,
) {
  const sql = db();
  const eventSlug = process.env.RUMGIP_EVENT_SLUG || 'rumgip-championship-v4';

  const rows = await sql`
    SELECT p.id, p.price_idr, p.name
    FROM passes p
    JOIN events e ON e.id = p.event_id
    WHERE e.slug = ${eventSlug}
      AND p.code = ${PASS_CODES[plan]}
      AND p.active = true
    LIMIT 1
  `;

  const pass = rows[0];
  if (!pass) throw new Error('Pass is not configured');

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

    return {
      orderId: orders[0].id,
      externalOrderId,
      token: snap.token,
      redirectUrl: snap.redirect_url,
    };
  } catch (error) {
    console.error('Midtrans checkout creation failed', {
      orderId: orders[0].id,
      externalOrderId,
      error,
    });
    throw new Error('Unable to create payment. Please try again.');
  }
}
