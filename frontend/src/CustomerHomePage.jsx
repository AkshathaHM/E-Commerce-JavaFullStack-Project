import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CategoryNavigation } from './CategoryNavigation';
import { ProductList } from './ProductList';
import './assets/styles.css';

export default function CustomerHomePage() {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [username, setUsername] = useState('Guest');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchProducts = useCallback(async (category = 'All') => {
    setLoading(true);
    try {
      const query = category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products${query}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
      });
      const data = await res.json();
      setProducts(data.products || []);
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

  const handleAddToCart = async (productId) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/cart/add`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ username, productId })
      });
      fetchCartCount();
    } catch (e) {}
  };

  return (
    <div className="customer-homepage">
      <Header cartCount={cartCount} username={username} />
      <nav className="navigation">
        <CategoryNavigation selectedCategory={selectedCategory} onCategoryClick={setSelectedCategory} />
      </nav>
      <main className="main-content">
        {loading ? <p>Loading products...</p> : <ProductList products={products} onAddToCart={handleAddToCart} />}
      </main>
      <Footer />
    </div>
  );
}