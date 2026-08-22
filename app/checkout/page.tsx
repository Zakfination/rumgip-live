'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function CheckoutContent() {
  const params = useSearchParams();
  const plan = params.get('plan') === 'full' ? 'full' : 'daily';
  const full = plan === 'full';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function pay() {
    setLoading(true);
    setError('');
    const r = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    const d = await r.json();
    if (r.status === 401) {
      window.location.href = `/login?next=/checkout?plan=${plan}`;
      return;
    }
    if (!r.ok) {
      setError(d.error || 'Checkout failed');
      setLoading(false);
      return;
    }
    window.location.href = d.redirectUrl;
  }

  return (
    <main className="container" style={{ padding: '60px 0', maxWidth: 720 }}>
      <Link className="muted" href="/">← Back</Link>
      <div className="card" style={{ padding: 32, marginTop: 24 }}>
        <span className="muted">CHECKOUT</span>
        <h1 style={{ fontSize: 40, margin: '10px 0' }}>
          {full ? 'FULL EVENT PASS' : 'DAILY PASS'}
        </h1>
        <div style={{ fontSize: 30, fontWeight: 800 }}>
          {full ? 'Rp99.000' : 'Rp29.000'}
        </div>
        <p className="muted">
          Bayar melalui Midtrans. Akses live hanya diberikan setelah pembayaran terverifikasi oleh server.
        </p>
        <button
          onClick={pay}
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 16, cursor: 'pointer' }}
        >
          {loading ? 'Opening secure payment…' : 'Continue to secure payment'}
        </button>
        {error && <p style={{ color: '#ff8d8d' }}>{error}</p>}
      </div>
    </main>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={<main className="container" style={{ padding: '60px 0' }}>Loading checkout…</main>}>
      <CheckoutContent />
    </Suspense>
  );
}
