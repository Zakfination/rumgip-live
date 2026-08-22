import { NextResponse } from 'next/server';
import { getSessionUser } from '@/src/lib/auth';
import { db } from '@/src/lib/neon';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const sql = db();
  const slug = process.env.RUMGIP_EVENT_SLUG || 'rumgip-championship-v4';
  const rows = await sql`SELECT e.id,e.name,e.status,s.playback_id,s.active FROM events e LEFT JOIN streams s ON s.event_id=e.id AND s.active=true WHERE e.slug=${slug} LIMIT 1`;
  const event = rows[0];
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  const access = await sql`SELECT id FROM entitlements WHERE user_id=${user.id} AND event_id=${event.id} AND starts_at<=now() AND expires_at>now() LIMIT 1`;
  if (!access.length) return NextResponse.json({ error: 'Live access required' }, { status: 403 });
  if (!event.playback_id || !event.active) return NextResponse.json({ error: 'Stream is not live yet' }, { status: 409 });
  return NextResponse.json({ ok: true, event: { id: event.id, name: event.name, status: event.status }, youtubeVideoId: event.playback_id });
}
