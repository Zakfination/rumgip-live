import { NextResponse } from 'next/server';
import { db } from '@/src/lib/neon';
import { requireAdmin } from '@/src/lib/admin';

function validId(value: unknown) {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{11}$/.test(value);
}

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const eventId = new URL(req.url).searchParams.get('eventId');
    if (!eventId) return NextResponse.json({ error: 'eventId required' }, { status: 400 });
    const sql = db();
    const rows = await sql`
      SELECT s.id, s.event_id, s.match_id, s.provider, s.playback_id, s.active, s.created_at
      FROM streams s
      WHERE s.event_id=${eventId}::uuid
      ORDER BY s.active DESC, s.created_at DESC
    `;
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { eventId, matchId, playbackId, active = true } = body;
    if (!eventId || !validId(playbackId)) {
      return NextResponse.json({ error: 'Valid YouTube video ID required' }, { status: 400 });
    }

    const sql = db();
    if (active) await sql`UPDATE streams SET active=false WHERE event_id=${eventId}::uuid`;
    const rows = await sql`
      INSERT INTO streams(event_id,match_id,provider,playback_id,active)
      VALUES(${eventId}::uuid,${matchId || null},'youtube',${playbackId},${Boolean(active)})
      RETURNING id,event_id,match_id,provider,playback_id,active,created_at
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Admin stream save failed', error);
    return NextResponse.json({ error: 'Unable to save stream' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const eventId = new URL(req.url).searchParams.get('eventId');
    if (!eventId) return NextResponse.json({ error: 'eventId required' }, { status: 400 });
    const sql = db();
    await sql`UPDATE streams SET active=false WHERE event_id=${eventId}::uuid`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
}
