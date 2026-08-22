import { redirect } from 'next/navigation';
import { getSessionUser } from '@/src/lib/auth';
import { db } from '@/src/lib/neon';

export default async function Admin() {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/admin');
  if (user.role !== 'admin') return <main className="container" style={{ padding: '60px 0' }}><div className="card" style={{ padding: 32 }}><h1>Admin access required.</h1><p className="muted">Your account is authenticated but does not have the admin role.</p></div></main>;
  const sql = db();
  const events = await sql`SELECT e.id,e.name,e.status,count(DISTINCT m.id)::int AS matches,count(DISTINCT s.id)::int AS streams FROM events e LEFT JOIN matches m ON m.event_id=e.id LEFT JOIN streams s ON s.event_id=e.id GROUP BY e.id ORDER BY e.created_at DESC`;
  return <main className="container" style={{ padding: '40px 0 80px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}><div><span className="muted">RUMGIP LIVE</span><h1 style={{ fontSize: 42, margin: '8px 0' }}>Control Room</h1></div><span className="pill">ADMIN</span></div>
    <div className="card" style={{ padding: 24, marginTop: 24 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}><div><strong style={{ fontSize: 22 }}>YouTube Live</strong><p className="muted" style={{ margin: '6px 0 0' }}>Paste a new YouTube Video ID and make it the active protected stream.</p></div><a className="btn btn-primary" href="/admin/streams">Manage streams</a></div></div>
    <div className="grid" style={{ marginTop: 28 }}>{events.map((e: any) => <div className="card" key={e.id} style={{ padding: 24 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ fontSize: 22 }}>{e.name}</strong><span className="pill">{e.status}</span></div><p className="muted">{e.matches} matches · {e.streams} streams</p><div style={{ display: 'flex', gap: 10, marginTop: 16 }}><a className="btn btn-ghost" href={`/admin/events/${e.id}`}>Manage event</a><a className="btn btn-primary" href="/admin/streams">Manage stream</a></div></div>)}</div>
  </main>;
}
