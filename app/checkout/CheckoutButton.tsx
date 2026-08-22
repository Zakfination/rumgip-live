'use client';

import { useState } from 'react';

type Plan = 'daily' | 'full';

export default function CheckoutButton({ plan }: { plan: Plan }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function pay() {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        const next = `/checkout?plan=${encodeURIComponent(plan)}`;
        window.location.assign(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      if (!response.ok) {
        setError(data?.error || 'Checkout failed. Please try again.');
        return;
      }

      if (!data?.redirectUrl) {
        setError('Payment gateway did not return a checkout URL. Please try again.');
        return;
      }

      window.location.assign(data.redirectUrl);
    } catch {
      setError('Unable to start payment. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={pay}
        disabled={loading}
        className="btn btn-primary"
        style={{ width: '100%', marginTop: 16, cursor: loading ? 'wait' : 'pointer' }}
      >
        {loading ? 'Opening secure payment…' : 'Continue to secure payment'}
      </button>
      {error && (
        <p role="alert" style={{ color: '#ff8d8d' }}>
          {error}
        </p>
      )}
    </>
  );
}
