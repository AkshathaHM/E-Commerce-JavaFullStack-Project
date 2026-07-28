import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProductList } from './products.js';

test('normalizeProductList converts API-shaped payloads into arrays', () => {
  assert.deepEqual(normalizeProductList([{ id: 1 }]), [{ id: 1 }]);
  assert.deepEqual(normalizeProductList({ products: [{ id: 2 }] }), [{ id: 2 }]);
  assert.deepEqual(normalizeProductList({ items: [{ id: 3 }] }), [{ id: 3 }]);
  assert.deepEqual(normalizeProductList(null), []);
  assert.deepEqual(normalizeProductList({}), []);
});
