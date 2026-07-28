import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeCartItemById, getCartItemQuantity, getCartItemStockLimit, canIncreaseCartItem } from './cartUtils.js';

test('mergeCartItemById merges duplicate product ids and increments quantity', () => {
  const merged = mergeCartItemById(
    [{ product_id: '1', quantity: 1, total_price: '100.00' }],
    { product_id: '1', quantity: 1, total_price: '100.00' },
  );

  assert.equal(merged.length, 1);
  assert.equal(getCartItemQuantity(merged[0]), 2);
  assert.equal(merged[0].total_price, '200.00');
});

test('mergeCartItemById appends a new product when no duplicate exists', () => {
  const merged = mergeCartItemById([], { product_id: '2', quantity: 1, total_price: '50.00' });

  assert.equal(merged.length, 1);
  assert.equal(getCartItemQuantity(merged[0]), 1);
});

test('stock helpers respect the available stock limit', () => {
  assert.equal(getCartItemStockLimit({ stock: 3 }), 3);
  assert.equal(canIncreaseCartItem({ quantity: 3, stock: 3 }), false);
  assert.equal(canIncreaseCartItem({ quantity: 2, stock: 3 }), true);
});
