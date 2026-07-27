import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getCache, setCache } from './utils/cache';

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
  const username = localStorage.getItem('username') || 'Guest';
  const cachedCart = getCache('cart_items');

  const [cartItems, setCartItems] = useState(() => cachedCart?.items || []);
  const [cartCount, setCartCount] = useState(() => (cachedCart?.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0));
  const [addedProductIds, setAddedProductIds] = useState(() => {
    const key = `added_cart_products_${username}`;
    const stored = localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : [];
    return new Set(parsed.map((id) => String(id)));
  });

  const updateCache = useCallback((items) => {
    try {
      const subtotal = items.reduce((sum, item) => sum + Number(item.total_price || item.price || item.price_per_unit || 0) * (item.quantity || 1), 0).toFixed(2);
      setCache('cart_items', { items, username, subtotal }, 20000);
    } catch (err) {
      console.warn('Cart cache update failed', err);
    }
  }, [username]);

  const updateCartState = useCallback((items) => {
    const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    setCartItems(items);
    setCartCount(count);
    updateCache(items);
  }, [updateCache]);

  const incrementCartCount = useCallback((amount = 1) => {
    setCartCount((prev) => Math.max(0, prev + amount));
  }, []);

  const decrementCartCount = useCallback((amount = 1) => {
    setCartCount((prev) => Math.max(0, prev - amount));
  }, []);

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
