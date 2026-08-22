import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from './neon';

const COOKIE = 'rumgip_session';
const TTL = 1000 * 60 * 60 * 24 * 30;

function secret() { if (!process.env.AUTH_SECRET) throw new Error('AUTH_SECRET is not configured'); return process.env.AUTH_SECRET; }
function sign(value: string) { return crypto.createHmac('sha256', secret()).update(value).digest('base64url'); }

export async function setSession(userId: string) {
  const value = `${userId}.${Date.now() + TTL}`;
  const jar = await cookies();
  jar.set(COOKIE, `${value}.${sign(value)}`, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: TTL / 1000 });
}

export async function getSessionUser() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const parts = raw.split('.');
  if (parts.length !== 3) return null;
  const [userId, expires, sig] = parts;
  const value = `${userId}.${expires}`;
  if (Number(expires) < Date.now() || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(sign(value)))) return null;
  const sql = db();
  const rows = await sql`SELECT id, email, name, role FROM users WHERE id = ${userId}::uuid LIMIT 1`;
  return rows[0] ?? null;
}

export async function clearSession() { (await cookies()).delete(COOKIE); }
