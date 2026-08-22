import { NextResponse } from 'next/server';
import { issueOtp } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  if (!rateLimit(`auth:${email}`, 5)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  try {
    const { code, expiresInSeconds } = await issueOtp(email);
    await sendOtpEmail(email, code);
    return NextResponse.json({ ok: true, expiresInSeconds });
  } catch (error) {
    console.error('OTP request failed', error);
    return NextResponse.json({ error: 'Unable to send verification code' }, { status: 500 });
  }
}
