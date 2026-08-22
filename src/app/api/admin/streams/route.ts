import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/neon';
export async function POST(req:Request){const u=await getSessionUser();if(u?.role!=='admin')return NextResponse.json({error:'Forbidden'},{status:403});const b=await req.json();if(!b.eventId||!b.playbackId)return NextResponse.json({error:'eventId and playbackId required'},{status:400});if(b.provider!=='youtube')return NextResponse.json({error:'Only YouTube is enabled for MVP'},{status:400});const rows=await db()`INSERT INTO streams(event_id,match_id,provider,playback_id,active) VALUES(${b.eventId}::uuid,${b.matchId?`${b.matchId}::uuid`:null},'youtube',${b.playbackId},${b.active!==false}) RETURNING *`;return NextResponse.json({stream:rows[0]},{status:201});}
