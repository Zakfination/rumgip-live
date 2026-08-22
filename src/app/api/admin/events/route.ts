import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/neon';
export async function GET() { const u=await getSessionUser(); if(u?.role!=='admin') return NextResponse.json({error:'Forbidden'},{status:403}); return NextResponse.json({events:await db()`SELECT * FROM events ORDER BY created_at DESC`}); }
export async function POST(req:Request) { const u=await getSessionUser(); if(u?.role!=='admin') return NextResponse.json({error:'Forbidden'},{status:403}); const b=await req.json(); if(!b.slug||!b.name) return NextResponse.json({error:'slug and name required'},{status:400}); const rows=await db()`INSERT INTO events(slug,name,description,starts_at,ends_at,status) VALUES(${b.slug},${b.name},${b.description||null},${b.startsAt||null},${b.endsAt||null},${b.status||'draft'}) RETURNING *`; return NextResponse.json({event:rows[0]},{status:201}); }
