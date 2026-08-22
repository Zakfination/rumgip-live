import Link from 'next/link';
import { startCheckout } from './actions';
import SubmitButton from './SubmitButton';

type Plan = 'daily' | 'full';

type SearchParams = {
  plan?: string;
  error?: string;
};

export default async function Checkout({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const plan: Plan = params.plan === 'full' ? 'full' : 'daily';
  const full = plan === 'full';
  const paymentError = params.error === 'payment';

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

        {paymentError && (
          <div role="alert" className="card" style={{ marginTop: 16, padding: 14 }}>
            <strong>Payment belum dapat dibuat.</strong>
            <p className="muted" style={{ margin: '6px 0 0' }}>
              Silakan coba lagi. Jika masih gagal, kami perlu memeriksa konfigurasi Midtrans di server.
            </p>
          </div>
        )}

        <form action={startCheckout}>
          <input type="hidden" name="plan" value={plan} />
          <SubmitButton />
        </form>
      </div>
    </main>
  );
}
