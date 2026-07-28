import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getCache, setCache } from './utils/cache';
import { getCartItemId, getCartItemQuantity } from './utils/cartUtils';

const CartContext = createContext({
  cartItems: [],
  cartCount: 0,
  addedProductIds: new Set(),
  setCartItems: () => {},
  setCartCount: () => {},
  setAddedProductIds: () => {},
  addProductToCart: () => {},
  removeProductFromCart: () => {},
  updateCartState: () => {},
  incrementCartCount: () => {},
  decrementCartCount: () => {},
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const username = typeof window !== 'undefined' ? (localStorage.getItem('username') || 'Guest') : 'Guest';
  const cachedCart = getCache('cart_items');

  const [cartItems, setCartItems] = useState(() => (cachedCart?.items || []));
  const [cartCount, setCartCount] = useState(() => (cachedCart?.items || []).reduce((sum, item) => sum + getCartItemQuantity(item), 0));
  const [addedProductIds, setAddedProductIds] = useState(() => {
    const key = `added_cart_products_${username}`;
    const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    const parsed = stored ? JSON.parse(stored) : [];
    return new Set(parsed.map((id) => String(id)));
  });

  const updateCache = useCallback((items) => {
    try {
      const subtotal = items.reduce((sum, item) => sum + Number(item.total_price || item.price || item.price_per_unit || 0) * getCartItemQuantity(item), 0).toFixed(2);
      const count = items.reduce((sum, item) => sum + getCartItemQuantity(item), 0);
      setCache('cart_items', { items, username, subtotal }, 20000);
      try { setCache(`cart_count_${username}`, count, 20000); } catch (e) {}
    } catch (err) {
      console.warn('Cart cache update failed', err);
    }
  }, [username]);

  const updateCartState = useCallback((items) => {
    const normalizedItems = Array.isArray(items) ? items : [];
    const count = normalizedItems.reduce((sum, item) => sum + getCartItemQuantity(item), 0);
    setCartItems(normalizedItems);
    setCartCount(count);
    updateCache(normalizedItems);
    try {
      const ids = normalizedItems.map((it) => String(getCartItemId(it))).filter(Boolean);
      const next = new Set(ids);
      setAddedProductIds(next);
      try { localStorage.setItem(`added_cart_products_${username}`, JSON.stringify(Array.from(next))); } catch (e) {}
    } catch (e) {
      // ignore
    }
  }, [updateCache, username]);

  const incrementCartCount = useCallback((amount = 1) => {
    setCartCount((prev) => {
      const next = Math.max(0, prev + amount);
      try { setCache(`cart_count_${username}`, next, 20000); } catch (e) {}
      return next;
    });
  }, [username]);

  const decrementCartCount = useCallback((amount = 1) => {
    setCartCount((prev) => {
      const next = Math.max(0, prev - amount);
      try { setCache(`cart_count_${username}`, next, 20000); } catch (e) {}
      return next;
    });
  }, [username]);

  const addProductToCart = useCallback((productId) => {
    const key = productId == null ? '' : String(productId);
    if (!key) return;
    setAddedProductIds((prev) => {
      const next = new Set(prev);
      next.add(key);
      localStorage.setItem(`added_cart_products_${username}`, JSON.stringify(Array.from(next)));
      return next;
    });
  }, [username]);

  const removeProductFromCart = useCallback((productId) => {
    const key = productId == null ? '' : String(productId);
    if (!key) return;
    setAddedProductIds((prev) => {
      const next = new Set(prev);
      next.delete(key);
      localStorage.setItem(`added_cart_products_${username}`, JSON.stringify(Array.from(next)));
      return next;
    });
  }, [username]);

  const value = useMemo(() => ({
    cartItems,
    cartCount,
    addedProductIds,
    setCartItems,
    setCartCount,
    setAddedProductIds,
    addProductToCart,
    removeProductFromCart,
    updateCartState,
    incrementCartCount,
    decrementCartCount,
  }), [cartItems, cartCount, addedProductIds, addProductToCart, removeProductFromCart, updateCartState, incrementCartCount, decrementCartCount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
