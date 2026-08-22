'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/live';
  return value;
}

export default function Login() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function request() {
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const r = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok) return setError(d?.error || 'Unable to send code');
      setSent(true);
    } catch {
      setError('Unable to send code. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const r = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const d = await r.json().catch(() => null);
      if (!r.ok) return setError(d?.error || 'Invalid code');
      window.location.assign(next);
    } catch {
      setError('Unable to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', maxWidth: 620 }}>
      <div className="card" style={{ padding: 32, width: '100%' }}>
        <span className="muted">RUMGIP LIVE</span>
        <h1 style={{ fontSize: 40, margin: '10px 0' }}>Sign in to continue.</h1>
        <p className="muted">We will send a one-time verification code to your email.</p>
        {!sent ? (
          <>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="field" autoComplete="email" />
            <button onClick={request} disabled={loading || !email} className="btn btn-primary" style={{ width: '100%', marginTop: 14 }}>
              {loading ? 'Sending…' : 'Send code'}
            </button>
          </>
        ) : (
          <>
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="6-digit code" className="field" autoComplete="one-time-code" />
            <button onClick={verify} disabled={loading || code.length !== 6} className="btn btn-primary" style={{ width: '100%', marginTop: 14 }}>
              {loading ? 'Verifying…' : 'Verify & continue'}
            </button>
            <button onClick={() => { setSent(false); setCode(''); setError(''); }} className="btn btn-ghost" style={{ width: '100%', marginTop: 10 }}>
              Change email
            </button>
          </>
        )}
        {error && <p role="alert" style={{ color: '#b42318' }}>{error}</p>}
      </div>
    </main>
  );
}
