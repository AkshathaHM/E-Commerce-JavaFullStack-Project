import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CustomerLayout } from './CustomerLayout';
import { CategoryNavigation } from './CategoryNavigation';
import { ProductList } from './ProductList';
import { ProductCardSkeleton } from './components/Skeleton';
import './assets/styles.css';

export default function CustomerHomePage() {
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [username, setUsername] = useState('Guest');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const productsCache = useRef(null);
  const cartCountCache = useRef(0);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchProducts = useCallback(async () => {
    if (productsCache.current) {
      setAllProducts(productsCache.current);
      setProducts(productsCache.current);
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
      setProducts(productList);
      setUsername(data.user?.name || 'Guest');
    } catch (err) {
      console.error(err);
      setError('Unable to load products right now.');
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
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCartCount();
  }, [username, fetchCartCount]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const normalizedCategory = selectedCategory === 'All' ? '' : selectedCategory.trim().toLowerCase();

    return allProducts.filter((product) => {
      const matchesCategory = !normalizedCategory || product.category?.trim().toLowerCase() === normalizedCategory;
      const searchableText = `${product.name || ''} ${product.description || ''} ${product.category || ''}`.toLowerCase();
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [allProducts, searchTerm, selectedCategory]);

  useEffect(() => {
    setProducts(filteredProducts);
  }, [filteredProducts]);

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

  const showSkeletons = loading && allProducts.length === 0;

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
    </CustomerLayout>
  );
}