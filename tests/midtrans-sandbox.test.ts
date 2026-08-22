import test from 'node:test';
import assert from 'node:assert/strict';
import { createSnapTransaction } from '../src/lib/midtrans';

test('Midtrans sandbox creates a Snap token when credentials are configured', async (t) => {
  if (!process.env.MIDTRANS_SERVER_KEY) { t.skip('MIDTRANS_SERVER_KEY not configured in CI/local environment'); return; }
  const orderId = `RUMGIP-TEST-${Date.now()}`;
  const result = await createSnapTransaction(orderId, 1000, { first_name: 'Rumgip QA', email: 'qa@example.com' });
  assert.ok(result.token);
  assert.match(result.redirect_url, /^https:\/\//);
});
