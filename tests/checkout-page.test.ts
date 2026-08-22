import test from 'node:test';
import assert from 'node:assert/strict';

test('checkout plan normalization keeps only full as full', () => {
  const normalize = (value?: string) => (value === 'full' ? 'full' : 'daily');

  assert.equal(normalize('full'), 'full');
  assert.equal(normalize('daily'), 'daily');
  assert.equal(normalize(undefined), 'daily');
  assert.equal(normalize('FULL'), 'daily');
});
