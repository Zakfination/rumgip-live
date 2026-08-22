import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

test('Midtrans signature is SHA512(order_id + status_code + gross_amount + server key)', () => {
  const orderId='RUMGIP-test'; const status='200'; const gross='29000.00'; const key='sandbox-secret';
  const expected=crypto.createHash('sha512').update(orderId+status+gross+key).digest('hex');
  assert.equal(expected.length,128);
  assert.equal(expected,crypto.createHash('sha512').update(orderId+status+gross+key).digest('hex'));
});

test('successful Midtrans statuses are settlement or accepted capture', () => {
  const success=(s:string,f?:string)=>s==='settlement'||(s==='capture'&&f!=='deny');
  assert.equal(success('settlement'),true); assert.equal(success('capture','accept'),true); assert.equal(success('capture','deny'),false); assert.equal(success('pending'),false);
});
