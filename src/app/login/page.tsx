'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/checkout';
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!seconds) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  async function requestOtp(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const response = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Gagal mengirim OTP.');
      setStep('otp');
      setSeconds(60);
      setMessage('Kode OTP sudah dikirim. Cek inbox atau folder spam.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'OTP tidak valid.');
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP tidak valid.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050608] text-white selection:bg-white selection:text-black">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,.12),transparent_35%),radial-gradient(circle_at_80%_90%,rgba(55,95,255,.14),transparent_32%)]" />
        <div className="relative w-full max-w-md">
          <div className="mb-8 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/45">
            <span>RUMGIP LIVE</span>
            <span>Championship V.4</span>
          </div>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-8">
            <div className="mb-8">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-white/45">Secure access</p>
              <h1 className="text-4xl font-semibold tracking-[-0.04em]">Watch live.</h1>
              <p className="mt-3 text-sm leading-6 text-white/55">Sign in with your email to access your Rumgip Live pass and protected stream.</p>
            </div>

            {step === 'email' ? (
              <form onSubmit={requestOtp} className="space-y-4">
                <label className="block text-sm text-white/70">
                  Email address
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 h-13 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm outline-none transition placeholder:text-white/25 focus:border-white/30"
                  />
                </label>
                <button disabled={busy} className="h-13 w-full rounded-2xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-wait disabled:opacity-50">
                  {busy ? 'Sending code…' : 'Continue with email'}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60">
                  Code sent to <span className="font-medium text-white">{email}</span>
                </div>
                <label className="block text-sm text-white/70">
                  6-digit OTP
                  <input
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="mt-2 h-14 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-center text-xl tracking-[0.45em] outline-none transition placeholder:text-white/20 focus:border-white/30"
                  />
                </label>
                <button disabled={busy || otp.length !== 6} className="h-13 w-full rounded-2xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50">
                  {busy ? 'Verifying…' : 'Verify & continue'}
                </button>
                <div className="flex items-center justify-between text-xs text-white/45">
                  <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); }} className="hover:text-white">Change email</button>
                  <button type="button" disabled={seconds > 0 || busy} onClick={requestOtp as unknown as () => void} className="disabled:opacity-40">
                    {seconds ? `Resend in ${seconds}s` : 'Resend code'}
                  </button>
                </div>
              </form>
            )}

            {message && <p className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-200">{message}</p>}
            {error && <p role="alert" className="mt-5 rounded-2xl border border-red-400/15 bg-red-400/5 px-4 py-3 text-sm text-red-200">{error}</p>}
          </section>

          <p className="mt-6 text-center text-xs leading-5 text-white/30">Your access is protected. Never share your OTP with anyone.</p>
        </div>
      </div>
    </main>
  );
}
