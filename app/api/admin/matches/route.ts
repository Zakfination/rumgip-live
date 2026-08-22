import { NextResponse } from 'next/server';
import { db } from '@/src/lib/neon';
import { requireAdmin } from '@/src/lib/admin';
export async function GET(req:Request){try{await requireAdmin();const eventId=new URL(req.url).searchParams.get('eventId');if(!eventId)return NextResponse.json({error:'eventId required'},{status:400});return NextResponse.json(await db()`SELECT * FROM matches WHERE event_id=${eventId}::uuid ORDER BY scheduled_at NULLS LAST`)}catch{return NextResponse.json({error:'Admin access required'},{status:403})}}
export async function POST(req:Request){try{await requireAdmin();const b=await req.json();const rows=await db()`INSERT INTO matches(event_id,round_name,home_team,away_team,scheduled_at,status) VALUES(${b.eventId}::uuid,${b.roundName},${b.homeTeam},${b.awayTeam},${b.scheduledAt||null},${b.status||'scheduled'}) RETURNING *`;return NextResponse.json(rows[0],{status:201})}catch{return NextResponse.json({error:'Unable to create match'},{status:400})}}
