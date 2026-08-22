import { NextResponse } from 'next/server';
import { issueOtp } from '@/src/lib/otp';
import { sendOtpEmail } from '@/src/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    const result = await issueOtp(email);
    await sendOtpEmail(email.trim().toLowerCase(), result.code);
    return NextResponse.json({ ok: true, expiresInSeconds: result.expiresInSeconds });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send OTP';
    return NextResponse.json({ error: message }, { status: 429 });
  }
}
