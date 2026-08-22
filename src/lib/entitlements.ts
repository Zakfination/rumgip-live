import { db } from './neon';

export async function grantEntitlement(orderId: string, userId: string, eventId: string, passId: string, startsAt: Date, expiresAt: Date) {
  const sql = db();
  await sql`
    INSERT INTO entitlements (id, user_id, event_id, pass_id, starts_at, expires_at, source_order_id)
    VALUES (gen_random_uuid(), ${userId}, ${eventId}, ${passId}, ${startsAt.toISOString()}, ${expiresAt.toISOString()}, ${orderId}::uuid)
    ON CONFLICT (source_order_id) DO NOTHING
  `;
}
