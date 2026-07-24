import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CustomerLayout } from './CustomerLayout';
import { CategoryNavigation } from './CategoryNavigation';
import { ProductList } from './ProductList';
import { ProductCardSkeleton } from './components/Skeleton';
import './assets/styles.css';

export default function CustomerHomePage() {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [username, setUsername] = useState('Guest');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const productsCache = useRef({});
  const cartCountCache = useRef(0);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchProducts = useCallback(async (category = 'All') => {
    // Return cached products immediately if available
    const cacheKey = category;
    if (productsCache.current[cacheKey]) {
      setProducts(productsCache.current[cacheKey]);
      return;
    }

    setLoading(true);
    try {
      const query = category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products${query}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
      });
      const data = await res.json();
      const productList = data.products || [];
      productsCache.current[cacheKey] = productList;
      setProducts(productList);
      setUsername(data.user?.name || 'Guest');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCartCount = useCallback(async () => {
    if (username === 'Guest') return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/items/count?username=${username}`, {
        credentials: 'include',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const count = await res.json();
        cartCountCache.current = count;
        setCartCount(count);
      }
    } catch (e) {}
  }, [username]);

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory, fetchProducts]);

  useEffect(() => {
    fetchCartCount();
  }, [username, fetchCartCount]);

  const handleAddToCart = useCallback(async (productId) => {
    // Optimistic update
    const newCount = cartCount + 1;
    setCartCount(newCount);
    cartCountCache.current = newCount;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/add`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ username, productId })
      });
      
      if (!res.ok) {
        // Revert on failure
        const revertedCount = newCount - 1;
        setCartCount(revertedCount);
        cartCountCache.current = revertedCount;
      }
    } catch (e) {
      // Revert on error
      const revertedCount = newCount - 1;
      setCartCount(revertedCount);
      cartCountCache.current = revertedCount;
    }
  }, [cartCount, username]);

  const showSkeletons = loading && products.length === 0;

  return (
    <CustomerLayout cartCount={cartCount} username={username}>
      <nav className="navigation">
        <CategoryNavigation selectedCategory={selectedCategory} onCategoryClick={setSelectedCategory} />
      </nav>
      <div className="main-content">
        <section className="home-hero">
          <div className="home-hero-content">
            <div>
              <p className="section-eyebrow">Smart shopping</p>
              <h2>Discover fresh picks for your next order</h2>
              <p>Browse curated essentials, enjoy a smoother checkout, and keep track of every delivery from one place.</p>
            </div>
          </div>
        </section>

        {showSkeletons ? (
          <div className="product-grid" aria-label="Loading featured products">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <ProductList products={products} onAddToCart={handleAddToCart} />
        )}
      </div>
    </CustomerLayout>
  );
}