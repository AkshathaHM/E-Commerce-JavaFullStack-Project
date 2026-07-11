import React, { useState, useEffect } from 'react';
import { CategoryNavigation } from './CategoryNavigation';
import { ProductList } from './ProductList';
import { Footer } from './Footer';
import { Header } from './Header';
import './assets/styles.css';

export default function CustomerHomePage() {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [username, setUsername] = useState('');
  const [cartError, setCartError] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [showCartNotification, setShowCartNotification] = useState(false);

  useEffect(() => {
    fetchProducts();

    if (username) {
      fetchCartCount();
    }
  }, [username]);

  const fetchProducts = async (category = '') => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products${
          category ? `?category=${category}` : '?category=Shirts'
        }`,
        {
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (data) {
        setUsername(data.user?.name || 'Guest');
        setProducts(data.products || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchCartCount = async () => {
    setIsCartLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cart/items/count?username=${username}`,
        {
          credentials: 'include',
        }
      );

      const count = await response.json();

      setCartCount(count);
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
    if (!username) {
      console.error('Username is required');
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