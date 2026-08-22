'use client';

import { useEffect, useState } from 'react';

type EventItem = { id: string; name: string; slug: string };
type Stream = { id: string; match_id: string | null; playback_id: string; active: boolean; created_at: string };

export default function StreamManager({ events }: { events: EventItem[] }) {
  const [eventId, setEventId] = useState(events[0]?.id ?? '');
  const [playbackId, setPlaybackId] = useState('');
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadStreams(id = eventId) { if (!id) return; setError(''); const res = await fetch(`/api/admin/streams?eventId=${encodeURIComponent(id)}`, { cache: 'no-store' }); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Unable to load streams'); setStreams(data); }
  useEffect(() => { loadStreams().catch((e) => setError(e.message)); }, [eventId]);
  async function save() { setMessage(''); setError(''); const id = playbackId.trim(); if (!/^[A-Za-z0-9_-]{11}$/.test(id)) { setError('Masukkan YouTube Video ID 11 karakter, bukan seluruh URL.'); return; } setLoading(true); try { const res = await fetch('/api/admin/streams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId, playbackId: id, active: true }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Unable to save stream'); setPlaybackId(''); setMessage('Stream aktif. Penonton yang sudah memiliki entitlement dapat mengakses live room.'); await loadStreams(); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save stream'); } finally { setLoading(false); } }
  async function stop() { setLoading(true); setMessage(''); setError(''); try { const res = await fetch(`/api/admin/streams?eventId=${encodeURIComponent(eventId)}`, { method: 'DELETE' }); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Unable to stop stream'); setMessage('Live stream dinonaktifkan.'); await loadStreams(); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to stop stream'); } finally { setLoading(false); } }
  const active = streams.find((s) => s.active);
  return <section className="card" style={{ padding: 24, marginTop: 28 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}><div><span className="muted">STREAM MANAGEMENT</span><h2 style={{ margin: '6px 0', fontSize: 28 }}>YouTube Live</h2><p className="muted">Paste the YouTube Video ID to control the protected stream.</p></div>{active ? <span className="pill" style={{ color: '#075d3b', borderColor: '#b8ead4', background: '#effcf6' }}>● LIVE</span> : <span className="pill">OFF AIR</span>}</div>
    <div style={{ display: 'grid', gap: 12, marginTop: 18 }}><label className="muted">Event<select className="field" value={eventId} onChange={(e) => setEventId(e.target.value)} style={{ marginTop: 6 }}>{events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></label><label className="muted">YouTube Video ID<input className="field" value={playbackId} onChange={(e) => setPlaybackId(e.target.value)} placeholder="e.g. dQw4w9WgXcQ" maxLength={11} autoComplete="off" style={{ marginTop: 6 }} /></label><p className="muted" style={{ margin: 0, fontSize: 13 }}>From <code>youtube.com/watch?v=XXXXXXXXXXX</code>, paste only the 11-character ID.</p><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><button className="btn btn-primary" onClick={save} disabled={loading || !eventId}>{loading ? 'Saving…' : 'Set as LIVE'}</button><button className="btn btn-ghost" onClick={stop} disabled={loading || !active}>Stop LIVE</button></div></div>
    {active && <div className="card" style={{ marginTop: 20, padding: 16, boxShadow: 'none' }}><strong>Active stream</strong><div style={{ marginTop: 6 }}><code>{active.playback_id}</code></div><a className="muted" href={`https://www.youtube.com/watch?v=${active.playback_id}`} target="_blank" rel="noreferrer">Open YouTube ↗</a></div>}
    {message && <p style={{ marginTop: 16 }}>{message}</p>}{error && <p role="alert" style={{ marginTop: 16 }}>{error}</p>}
    {streams.length > 0 && <div style={{ marginTop: 24 }}><span className="muted">History</span>{streams.map((s) => <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid #dbe9f8' }}><code>{s.playback_id}</code><span className="muted">{s.active ? 'ACTIVE' : 'inactive'}</span></div>)}</div>}
  </section>;
}
