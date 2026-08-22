'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type State = 'loading' | 'pending' | 'paid' | 'failed' | 'login' | 'missing' | 'error';

export default function PaymentResult() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [state, setState] = useState<State>(orderId ? 'loading' : 'missing');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    async function check() {
      try {
        const res = await fetch(`/api/orders/status?order_id=${encodeURIComponent(orderId)}`, { cache: 'no-store' });
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (res.status === 401) { setState('login'); return; }
        if (res.status === 404) { setState('missing'); return; }
        if (!res.ok) throw new Error(data?.error || 'Unable to check payment');
        setStatus(data?.status || 'pending');
        if (data?.status === 'paid' && data?.entitled) { setState('paid'); return; }
        if (['failed', 'cancelled', 'expired'].includes(data?.status)) { setState('failed'); return; }
        setState('pending');
        attempts += 1;
        if (attempts < 20) timer = setTimeout(check, 3000);
      } catch {
        if (!cancelled) setState('error');
      }
    }

    check();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [orderId]);

  if (state === 'paid') return <main className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', maxWidth: 680 }}><div className="card" style={{ padding: 36, width: '100%', textAlign: 'center' }}><div className="pill" style={{ display: 'inline-block', color: '#075d3b', borderColor: '#b8ead4', background: '#effcf6' }}>PAYMENT CONFIRMED</div><h1 style={{ fontSize: 42, margin: '16px 0 8px' }}>You're in.</h1><p className="muted">Payment is verified and your live access is active.</p><Link className="btn btn-primary" href="/live" style={{ marginTop: 16 }}>Enter Live Room</Link></div></main>;
  if (state === 'failed') return <main className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', maxWidth: 680 }}><div className="card" style={{ padding: 36, width: '100%', textAlign: 'center' }}><span className="pill">PAYMENT NOT COMPLETED</span><h1 style={{ fontSize: 38, margin: '16px 0 8px' }}>Payment unsuccessful.</h1><p className="muted">Your order was not paid. You can return to the passes and try again.</p><Link className="btn btn-primary" href="/#passes" style={{ marginTop: 16 }}>Choose a pass</Link></div></main>;
  if (state === 'login') return <main className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', maxWidth: 680 }}><div className="card" style={{ padding: 36, width: '100%', textAlign: 'center' }}><h1 style={{ fontSize: 38 }}>Sign in required.</h1><p className="muted">Sign in with the account used for this order to verify payment.</p><Link className="btn btn-primary" href={`/login?next=${encodeURIComponent(`/payment/result?order_id=${orderId}`)}`} style={{ marginTop: 16 }}>Sign in</Link></div></main>;
  if (state === 'missing') return <main className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', maxWidth: 680 }}><div className="card" style={{ padding: 36, width: '100%', textAlign: 'center' }}><h1>Payment link unavailable.</h1><p className="muted">We could not identify this order.</p><Link className="btn btn-ghost" href="/" style={{ marginTop: 16 }}>Back home</Link></div></main>;
  if (state === 'error') return <main className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', maxWidth: 680 }}><div className="card" style={{ padding: 36, width: '100%', textAlign: 'center' }}><h1>We are checking your payment.</h1><p className="muted">Please refresh in a moment. Your payment is never granted from the browser; access is enabled only after server verification.</p><button className="btn btn-ghost" onClick={() => window.location.reload()} style={{ marginTop: 16 }}>Refresh</button></div></main>;

  return <main className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', maxWidth: 680 }}><div className="card" style={{ padding: 36, width: '100%', textAlign: 'center' }}><div className="pill" style={{ display: 'inline-block' }}>VERIFYING PAYMENT</div><h1 style={{ fontSize: 38, margin: '16px 0 8px' }}>Almost there.</h1><p className="muted">We are waiting for Midtrans to confirm your payment. This page checks the server automatically.</p><p className="muted" style={{ fontSize: 13 }}>Order status: {status || 'pending'}</p><Link className="btn btn-ghost" href="/" style={{ marginTop: 16 }}>Back home</Link></div></main>;
}
