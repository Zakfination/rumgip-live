import { NextResponse } from 'next/server';
import { consumeOtp } from '@/lib/otp';
import { db } from '@/lib/neon';
import { setSession } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const code = String(body.code || '').trim();
  if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(code)) return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  if (!rateLimit(`verify:${email}`, 10)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  try {
    const valid = await consumeOtp(email, code);
    if (!valid) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
    const sql = db();
    const users = await sql`INSERT INTO users (email) VALUES (${email}) ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email RETURNING id, email, name, role`;
    await setSession(String(users[0].id));
    return NextResponse.json({ user: users[0] });
  } catch (error) {
    console.error('OTP verification failed', error);
    return NextResponse.json({ error: 'Unable to verify code' }, { status: 500 });
  }
}
