import Link from 'next/link';
import CheckoutButton from './CheckoutButton';

type Plan = 'daily' | 'full';

export default async function Checkout({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const plan: Plan = params.plan === 'full' ? 'full' : 'daily';
  const full = plan === 'full';

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
        <CheckoutButton plan={plan} />
      </div>
    </main>
  );
}
