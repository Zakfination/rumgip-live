import { redirect } from 'next/navigation';
import { getSessionUser } from '@/src/lib/auth';
import { db } from '@/src/lib/neon';
import StreamManager from './StreamManager';

export default async function AdminStreamsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/admin/streams');
  if (user.role !== 'admin') return <main className="container" style={{ padding: '60px 0' }}><div className="card" style={{ padding: 32 }}><h1>Admin access required.</h1><p className="muted">Your account is authenticated but does not have the admin role.</p></div></main>;

  const events = await db()`SELECT id, name, slug FROM events ORDER BY starts_at NULLS LAST, created_at DESC`;
  return <main className="container" style={{ padding: '40px 0 80px' }}>
    <a className="muted" href="/admin">← Back to Control Room</a>
    <div style={{ marginTop: 24 }}><span className="muted">RUMGIP LIVE / ADMIN</span><h1 style={{ fontSize: 42, margin: '8px 0' }}>Stream Management</h1><p className="muted">Control which YouTube Live stream is exposed to paid viewers.</p></div>
    {events.length ? <StreamManager events={events as { id: string; name: string; slug: string }[]} /> : <div className="card" style={{ padding: 24, marginTop: 28 }}>No events configured yet.</div>}
  </main>;
}
