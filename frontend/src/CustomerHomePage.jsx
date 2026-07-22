import React, { useState, useEffect } from 'react';
import { CategoryNavigation } from './CategoryNavigation';
import { ProductList } from './ProductList';
import { Footer } from './Footer';
import { Header } from './Header';
import './assets/styles.css';

export default function CustomerHomePage() {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [cartError, setCartError] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [isGuest, setIsGuest] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (username && username !== 'Guest') {
      fetchCartCount();
    } else {
      setCartCount(0);
      setCartError(false);
      setIsCartLoading(false);
    }
  }, [username]);

  const fetchProducts = async (category = '') => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products${
          category ? `?category=${encodeURIComponent(category)}` : '?category=Shirts'
        }`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to load products');
      }

      setUsername(data.user?.name || 'Guest');
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchCartCount = async () => {
    if (!username || username === 'Guest') {
      setCartCount(0);
      setCartError(false);
      setIsCartLoading(false);
      return;
    }

    setIsCartLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cart/items/count?username=${username}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch cart count');
      }

      setCartCount(typeof data === 'number' ? data : Number(data) || 0);
      setCartError(false);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartError(true);
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    fetchProducts(category);
  };

  const handleAddToCart = async (productId) => {
    if (!username || username === 'Guest') {
      alert('Please log in to add items to your cart.');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cart/add`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            username,
            productId,
          }),
        }
      );

      if (response.ok) {
        fetchCartCount();
        setShowCartNotification(true);
        setTimeout(() => setShowCartNotification(false), 3000);
      } else {
        console.error('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  return (
    <div className="customer-homepage">
      {showCartNotification && (
        <div className="cart-notification">
          Cart Added Successfully
        </div>
      )}

      <Header
        cartCount={isCartLoading ? '...' : cartError ? 'Error' : cartCount}
        username={username}
      />

      <nav className="navigation">
        <CategoryNavigation onCategoryClick={handleCategoryClick} />
      </nav>

      <main className="main-content">
        <ProductList
          products={products}
          onAddToCart={handleAddToCart}
        />
      </main>

      <Footer />
    </div>
  );
}