import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/neon';
export async function POST(req:Request){const u=await getSessionUser();if(u?.role!=='admin')return NextResponse.json({error:'Forbidden'},{status:403});const b=await req.json();if(!b.eventId||!b.homeTeam||!b.awayTeam)return NextResponse.json({error:'Missing fields'},{status:400});const rows=await db()`INSERT INTO matches(event_id,round_name,home_team,away_team,scheduled_at,status) VALUES(${b.eventId}::uuid,${b.roundName||'Match'},${b.homeTeam},${b.awayTeam},${b.scheduledAt||null},${b.status||'scheduled'}) RETURNING *`;return NextResponse.json({match:rows[0]},{status:201});}
