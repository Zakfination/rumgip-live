import { NextResponse } from 'next/server';
import { db } from '@/src/lib/neon';
import { consumeOtp } from '@/src/lib/otp';
import { setSession } from '@/src/lib/auth';

export async function POST(req: Request) {
  const { email, code } = await req.json();
  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || typeof code !== 'string' || !/^\d{6}$/.test(code)) return NextResponse.json({ error: 'Invalid verification request' }, { status: 400 });
  const valid = await consumeOtp(email, code);
  if (!valid) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
  const sql = db();
  const rows = await sql`INSERT INTO users(email) VALUES(${email.trim().toLowerCase()}) ON CONFLICT(email) DO UPDATE SET email=EXCLUDED.email RETURNING id, email, name, role`;
  await setSession(rows[0].id);
  return NextResponse.json({ ok: true, user: rows[0] });
}
