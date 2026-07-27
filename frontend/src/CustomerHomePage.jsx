import React, { useState, useEffect, useCallback, useMemo, useDeferredValue, useRef } from 'react';
import { CustomerLayout } from './CustomerLayout';
import { ProductList } from './ProductList';
import { ProductCardSkeleton } from './components/Skeleton';
import CustomModal from './CustomModal';
import { cachedFetch } from './utils/apiClient';
import { getCache, setCache } from './utils/cache';
import { useCart } from './CartContext';
import './assets/styles.css';

export default function CustomerHomePage() {
  const { cartCount, addedProductIds, addProductToCart, removeProductFromCart, incrementCartCount, decrementCartCount, setCartCount } = useCart();
  const initialProducts = getCache('products_all') || [];
  const [allProducts, setAllProducts] = useState(initialProducts);
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Guest');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(() => initialProducts.length === 0);
  const [error, setError] = useState('');
  const [profileModalType, setProfileModalType] = useState(null);
  const [profileModalData, setProfileModalData] = useState(null);
  const [profileModalLoading, setProfileModalLoading] = useState(false);
  const [profileModalResponse, setProfileModalResponse] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const cartCountCache = useRef({ username: localStorage.getItem('username') || 'Guest', count: cartCount });

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchProducts = useCallback(async (forceReload = false) => {
    const cacheKey = 'products_all';
    const cachedProducts = getCache(cacheKey);
    if (cachedProducts && !forceReload) {
      setAllProducts(cachedProducts);
      setLoading(false);
    } else if (!cachedProducts) {
      setLoading(true);
    }

    setError('');

    try {
      const data = await cachedFetch(
        cacheKey,
        `${import.meta.env.VITE_API_URL}/api/products`,
        { credentials: 'include', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } },
        60000,
      );

      const productList = Array.isArray(data?.products) ? data.products : (Array.isArray(data) ? data : []);
      if (productList.length) {
        setAllProducts(productList);
        setCache(cacheKey, productList, 60000);
      }

      if (data?.user) {
        setUsername(data.user.name || data.user.username || localStorage.getItem('username') || 'Guest');
      }
    } catch (err) {
      console.error(err);
      if (!cachedProducts) {
        setError('Unable to load products right now.');
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const fetchCartCount = useCallback(async () => {
    const activeUsername = localStorage.getItem('username') || username || 'Guest';
    if (!activeUsername || activeUsername === 'Guest') {
      setCartCount(0);
      return;
    }

    const cacheKey = `cart_count_${activeUsername}`;
    const cachedCount = getCache(cacheKey);
    if (cachedCount !== null) {
      setCartCount(cachedCount);
    }

    try {
      const data = await cachedFetch(cacheKey, `${import.meta.env.VITE_API_URL}/api/cart/items/count?username=${encodeURIComponent(activeUsername)}`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      }, 30000);
      if (data !== null && data !== undefined) {
        setCartCount(data);
        setCache(cacheKey, data, 30000);
      }
    } catch (e) {
      console.warn('Cart count fetch failed', e);
    }
  }, [getAuthHeaders, username, setCartCount]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase();

    return allProducts.filter((product) => {
      const searchableText = [
        product.name,
        product.description,
        product.category,
        product.brand,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return !normalizedSearch || searchableText.includes(normalizedSearch);
    });
  }, [allProducts, deferredSearchTerm]);

  const handleAddToCart = useCallback(async (productId) => {
    if (!productId) return false;

    const activeUsername = localStorage.getItem('username') || username || 'Guest';

    try {
      // optimistic UI: update local cart state immediately
      addProductToCart(productId);
      incrementCartCount();

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/add`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ username: activeUsername, productId }),
      });

      if (!res.ok) {
        // rollback optimistic update
        removeProductFromCart?.(productId);
        decrementCartCount?.(1);
        return false;
      }

      return true;
    } catch (e) {
      console.error('Add to cart failed:', e);
      // rollback optimistic update
      removeProductFromCart?.(productId);
      decrementCartCount?.(1);
      return false;
    }
  }, [getAuthHeaders, username, addProductToCart, removeProductFromCart, incrementCartCount, decrementCartCount]);

  const handleOpenProfileModal = useCallback(async () => {
    setProfileModalType('viewProfile');
    setProfileModalLoading(true);
    setProfileModalResponse('');
    setProfileModalData(null);

    try {
      const profile = await cachedFetch(
        'profile_me',
        `${import.meta.env.VITE_API_URL}/api/auth/me`,
        { credentials: 'include', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } },
        60000,
      );
      setProfileModalData(profile);
    } catch (err) {
      setProfileModalResponse(err.message || 'Unable to load your profile right now.');
    } finally {
      setProfileModalLoading(false);
    }
  }, [getAuthHeaders]);

  const handleCloseProfileModal = useCallback(() => {
    setProfileModalType(null);
    setProfileModalData(null);
    setProfileModalResponse('');
  }, []);

  const showSkeletons = loading && allProducts.length === 0;

  return (
    <CustomerLayout username={username}>
      <div className="main-content">
        <section className="home-hero">
          <div className="home-hero-content">
            <div>
              <h2>Hello, {username}!</h2>
              <p>Discover products, manage your cart, and track every order with ease.</p>
            </div>
            <div className="home-hero-actions">
              {/* Profile accessible only via profile dropdown now; remove dashboard button for customer */}
            </div>
          </div>
        </section>

        <div className="product-toolbar">
          <label className="product-search" htmlFor="product-search">
            <span aria-hidden="true">🔎</span>
            <input
              id="product-search"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products by name, category or description"
            />
          </label>
          <div className="product-results-pill">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </div>
        </div>

        {showSkeletons ? (
          <div className="product-grid" aria-label="Loading featured products">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <ProductList products={filteredProducts} onAddToCart={handleAddToCart} addedProductIds={addedProductIds} error={error} />
        )}
      </div>

      {profileModalType && (
        <CustomModal
          modalType={profileModalType}
          onClose={handleCloseProfileModal}
          onSubmit={() => {}}
          response={profileModalResponse}
          modalData={profileModalData}
          loading={profileModalLoading}
        />
      )}
    </CustomerLayout>
  );
}