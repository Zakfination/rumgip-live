import { db } from './neon';

export async function hasLiveAccess(userId: string, eventId: string) {
  const sql = db();
  const rows = await sql`
    SELECT id FROM entitlements
    WHERE user_id = ${userId}
      AND event_id = ${eventId}
      AND starts_at <= now()
      AND expires_at > now()
    LIMIT 1
  `;
  return rows.length > 0;
}
