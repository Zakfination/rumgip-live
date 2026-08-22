import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

export function db() {
  if (!databaseUrl) throw new Error('DATABASE_URL is not configured');
  return neon(databaseUrl);
}
