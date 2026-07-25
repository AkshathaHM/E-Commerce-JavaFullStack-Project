import React, { useState, useEffect, useCallback, useMemo, useRef, useDeferredValue } from 'react';
import { CustomerLayout } from './CustomerLayout';
import { ProductList } from './ProductList';
import { ProductCardSkeleton } from './components/Skeleton';
import CustomModal from './CustomModal';
import './assets/styles.css';

export default function CustomerHomePage() {
  const [allProducts, setAllProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [username, setUsername] = useState('Guest');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileModalType, setProfileModalType] = useState(null);
  const [profileModalData, setProfileModalData] = useState(null);
  const [profileModalLoading, setProfileModalLoading] = useState(false);
  const [profileModalResponse, setProfileModalResponse] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const productsCache = useRef(null);
  const cartCountCache = useRef({ username: null, count: 0 });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchProducts = useCallback(async () => {
    if (productsCache.current) {
      setAllProducts(productsCache.current);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
      });
      if (!res.ok) {
        throw new Error('Unable to load products');
      }
      const data = await res.json();
      const productList = Array.isArray(data.products) ? data.products : [];
      productsCache.current = productList;
      setAllProducts(productList);
      const activeUsername = data.user?.name || data.user?.username || localStorage.getItem('username') || 'Guest';
      setUsername(activeUsername);
    } catch (err) {
      console.error(err);
      setError('Unable to load products right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCartCount = useCallback(async () => {
    if (username === 'Guest') return;
    if (cartCountCache.current.username === username && cartCountCache.current.count !== null) {
      setCartCount(cartCountCache.current.count);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/items/count?username=${username}`, {
        credentials: 'include',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const count = await res.json();
        cartCountCache.current = { username, count };
        setCartCount(count);
      }
    } catch (e) {}
  }, [username]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCartCount();
  }, [username, fetchCartCount]);

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
    if (!productId) return;

    const activeUsername = localStorage.getItem('username') || username || 'Guest';
    const newCount = cartCount + 1;
    setCartCount((prev) => prev + 1);
    cartCountCache.current = { username: activeUsername, count: newCount };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/add`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ username: activeUsername, productId })
      });

      if (!res.ok) {
        const revertedCount = newCount - 1;
        setCartCount(revertedCount);
        cartCountCache.current = { username: activeUsername, count: revertedCount };
      }
    } catch (e) {
      const revertedCount = newCount - 1;
      setCartCount(revertedCount);
      cartCountCache.current = { username: activeUsername, count: revertedCount };
    }
  }, [cartCount, username]);

  const handleOpenProfileModal = useCallback(async () => {
    setProfileModalType('viewProfile');
    setProfileModalLoading(true);
    setProfileModalResponse('');
    setProfileModalData(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      });

      if (!res.ok) {
        throw new Error('Unable to load your profile right now.');
      }

      const profile = await res.json();
      setProfileModalData(profile);
    } catch (err) {
      setProfileModalResponse(err.message || 'Unable to load your profile right now.');
    } finally {
      setProfileModalLoading(false);
    }
  }, []);

  const handleCloseProfileModal = () => {
    setProfileModalType(null);
    setProfileModalData(null);
    setProfileModalResponse('');
  };

  const showSkeletons = loading && allProducts.length === 0;

  return (
    <CustomerLayout cartCount={cartCount} username={username}>
      <div className="main-content">
        <section className="home-hero">
          <div className="home-hero-content">
            <div>
              <p className="section-eyebrow">Smart shopping</p>
              <h2>Discover fresh picks for your next order</h2>
              <p>Browse curated essentials, enjoy a smoother checkout, and keep track of every delivery from one place.</p>
            </div>
            <div className="home-hero-actions">
              <button type="button" className="primary-action-btn" onClick={handleOpenProfileModal}>My Profile</button>
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
          <ProductList products={filteredProducts} onAddToCart={handleAddToCart} error={error} />
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