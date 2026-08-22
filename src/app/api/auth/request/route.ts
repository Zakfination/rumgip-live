import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { db } from '@/lib/neon';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({})); const email = String(body.email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  if (!rateLimit(`auth:${email}`, 5)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  const code = String(crypto.randomInt(100000, 1000000)); const hash = crypto.createHash('sha256').update(code).digest('hex'); const sql = db();
  await sql`UPDATE auth_codes SET consumed_at = now() WHERE email = ${email} AND consumed_at IS NULL`;
  await sql`INSERT INTO auth_codes (email, code_hash, expires_at) VALUES (${email}, ${hash}, now() + interval '10 minutes')`;
  // Delivery provider intentionally separated; do not log OTP in production.
  if (process.env.NODE_ENV !== 'production') console.info(`DEV OTP for ${email}: ${code}`);
  return NextResponse.json({ ok: true });
}
