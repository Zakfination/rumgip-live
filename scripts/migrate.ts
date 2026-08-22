import { readFile } from 'node:fs/promises';
import { Client } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required');
const client = new Client({ connectionString: url });
await client.connect();
try {
  const sql = await readFile(new URL('../db/schema.sql', import.meta.url), 'utf8');
  const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
  for (const statement of statements) await client.query(statement);
  console.log(`Applied ${statements.length} schema statements.`);
} finally { await client.end(); }
