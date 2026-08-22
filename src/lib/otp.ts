import crypto from 'node:crypto';
import { db } from './neon';

const TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const OTP_PEPPER = process.env.OTP_PEPPER || process.env.AUTH_SECRET;

function hash(code: string) {
  if (!OTP_PEPPER) throw new Error('OTP_PEPPER or AUTH_SECRET is not configured');
  return crypto.createHash('sha256').update(`${code}:${OTP_PEPPER}`).digest('hex');
}

export async function issueOtp(email: string) {
  const sql = db();
  const normalized = email.trim().toLowerCase();
  const recent = await sql`SELECT count(*)::int AS count FROM auth_codes WHERE email=${normalized} AND created_at > now() - interval '10 minutes'`;
  if (Number(recent[0]?.count || 0) >= 5) throw new Error('Too many OTP requests. Try again later.');
  const code = crypto.randomInt(100000, 1000000).toString();
  await sql`UPDATE auth_codes SET consumed_at=now() WHERE email=${normalized} AND consumed_at IS NULL`;
  await sql`INSERT INTO auth_codes(email,code_hash,expires_at) VALUES(${normalized},${hash(code)},now()+(${TTL_MINUTES} || ' minutes')::interval)`;
  return { code, expiresInSeconds: TTL_MINUTES * 60 };
}

export async function consumeOtp(email: string, code: string) {
  const sql = db();
  const normalized = email.trim().toLowerCase();
  const rows = await sql`SELECT id, code_hash, expires_at, attempts FROM auth_codes WHERE email=${normalized} AND consumed_at IS NULL ORDER BY created_at DESC LIMIT 1`;
  const row = rows[0];
  if (!row || new Date(row.expires_at).getTime() <= Date.now() || Number(row.attempts) >= MAX_ATTEMPTS) return false;
  if (hash(code) !== row.code_hash) {
    await sql`UPDATE auth_codes SET attempts=attempts+1 WHERE id=${row.id}`;
    return false;
  }
  await sql`UPDATE auth_codes SET consumed_at=now() WHERE id=${row.id}`;
  return true;
}
