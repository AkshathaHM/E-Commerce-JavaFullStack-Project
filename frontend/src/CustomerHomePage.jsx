import React, { useState, useEffect, useCallback, useMemo, useDeferredValue, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerLayout } from './CustomerLayout';
import { ProductList } from './ProductList';
import { ProductCardSkeleton } from './components/Skeleton';
import CustomModal from './CustomModal';
import { CategoryNavigation } from './CategoryNavigation';
import { cachedFetch } from './utils/apiClient';
import { getCache, setCache } from './utils/cache';
import { useCart } from './CartContext';
import { normalizeProductList } from './utils/products';
import { mergeCartItemById } from './utils/cartUtils';
import { getApiUrl } from './auth';
import './assets/styles.css';

export default function CustomerHomePage() {
  const navigate = useNavigate();
  const { cartItems, cartCount, addedProductIds, addProductToCart, removeProductFromCart, setCartCount, updateCartState } = useCart();
  const initialProducts = getCache('products_all') || [];
  const [allProducts, setAllProducts] = useState(initialProducts);
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Guest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(() => initialProducts.length === 0);
  const [error, setError] = useState('');
  const [sharedCartInvite, setSharedCartInvite] = useState('');
  const [sharedCartError, setSharedCartError] = useState('');
  const [sharedCartLoading, setSharedCartLoading] = useState(false);
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

  const handleJoinSharedCart = useCallback(async () => {
    if (!sharedCartInvite || sharedCartInvite.trim().length === 0) {
      setSharedCartError('Enter a valid shared cart invite link or ID.');
      return;
    }

    setSharedCartError('');
    setSharedCartLoading(true);

    try {
      const invite = sharedCartInvite.trim();
      const shareId = invite.includes('/shared-cart/') ? invite.split('/shared-cart/').pop() : invite;
      if (!shareId) {
        throw new Error('Invalid share ID.');
      }

      const url = getApiUrl('/api/shared-cart/join');
      console.debug('Join shared cart request', { url, headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: { shareId } });
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ shareId }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error((body && body.error) || 'Unable to join shared cart.');
      }

      navigate(`/shared-cart/${encodeURIComponent(shareId)}`);
    } catch (err) {
      setSharedCartError(err.message || 'Failed to join shared cart.');
    } finally {
      setSharedCartLoading(false);
    }
  }, [getAuthHeaders, navigate, sharedCartInvite]);

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

      const productList = normalizeProductList(data);
      if (productList.length) {
        setAllProducts(productList);
        setCache(cacheKey, productList, 60000);
      } else if (!Array.isArray(data)) {
        setAllProducts([]);
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
      const localCount = (Array.isArray(cartItems) ? cartItems : []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      setCartCount(localCount);
      return;
    }

    const cacheKey = `cart_count_${activeUsername}`;
    const cachedCount = getCache(cacheKey);
    if (cachedCount !== null) {
      setCartCount(cachedCount);
    }

    // Prefer fetching full cart items and calculate badge from quantities to avoid stock-field misuse
    try {
      const cartData = await cachedFetch('cart_items', `${import.meta.env.VITE_API_URL}/api/cart/items`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      }, 30000);

      if (cartData && cartData.cart && Array.isArray(cartData.cart.products)) {
        const count = cartData.cart.products.reduce((s, it) => s + Number(it.quantity || it.qty || 0), 0);
        setCartCount(count);
        try { setCache(cacheKey, count, 30000); } catch (e) {}
        return;
      }

      // fallback to dedicated count endpoint if items endpoint not available
      const data = await cachedFetch(cacheKey, `${import.meta.env.VITE_API_URL}/api/cart/items/count?username=${encodeURIComponent(activeUsername)}`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      }, 30000);
      if (data !== null && data !== undefined) {
        setCartCount(Number(data));
        setCache(cacheKey, Number(data), 30000);
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
    const normalizedCategory = selectedCategory.trim().toLowerCase();

    const categoryTokens = {
      shirts: ['shirt', 'shirts', 't-shirt', 'tee'],
      pants: ['pant', 'pants', 'trouser', 'trousers', 'jeans'],
      sarees: ['saree', 'sarees', 'saari', 'saaree'],
      kurtas: ['kurta', 'kurtas', 'kurti', 'kurtis'],
      'western dresses': ['western dress', 'western dresses', 'dress', 'dresses', 'gown'],
      accessories: ['accessorie', 'accessories', 'jewelry', 'jewellery', 'bag', 'belt'],
      mobiles: ['mobile', 'mobile phone', 'smartphone', 'phone'],
      'mobile accessories': ['mobile accessories', 'phone accessories', 'charger', 'earbuds', 'earphones', 'headphones'],
    };

    const categoryKeywords = categoryTokens[normalizedCategory] || [normalizedCategory];

    const products = Array.isArray(allProducts) ? allProducts : [];

    return products.filter((product) => {
      const searchableText = [
        product.name,
        product.description,
        product.category,
        product.brand,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesCategory = normalizedCategory === 'all'
        || categoryKeywords.some((token) => searchableText.includes(token));

      return matchesSearch && matchesCategory;
    });
  }, [allProducts, deferredSearchTerm, selectedCategory]);

  const handleAddToCart = useCallback(async (product) => {
    if (!product) return false;
    const productId = String(product.product_id ?? product.id ?? product.productId);
    if (!productId) return false;

    const activeUsername = localStorage.getItem('username') || username || 'Guest';

    const minimalItem = {
      product_id: productId,
      quantity: 1,
      price_per_unit: (Number(product.price ?? product.amount ?? 0)).toFixed(2),
      total_price: (Number(product.price ?? product.amount ?? 0)).toFixed(2),
      display_name: product.name || product.title || 'Product',
      display_description: product.description || '',
      display_image_url: (product.images && product.images[0]) || product.imageUrl || product.image || '/images/no-image.png',
      image_url: (product.images && product.images[0]) || product.imageUrl || product.image || '/images/no-image.png',
      name: product.name || product.title || 'Product',
      description: product.description || '',
      price: Number(product.price ?? product.amount ?? 0),
      image: (product.images && product.images[0]) || product.imageUrl || product.image || '/images/no-image.png',
      imageUrl: (product.images && product.images[0]) || product.imageUrl || product.image || '/images/no-image.png',
      category: product.category || '',
      brand: product.brand || '',
      stock: product.stock ?? product.availableStock ?? product.available_stock ?? product.inventory ?? null,
    };

    const prevItems = Array.isArray(cartItems) ? cartItems : [];
    const nextItems = mergeCartItemById(prevItems, minimalItem);

    // optimistic UI updates
    try {
      updateCartState(nextItems);
      addProductToCart(productId);
      try { setCache('cart_items', { items: nextItems, username: activeUsername, subtotal: nextItems.reduce((s, it) => s + Number(it.total_price || 0), 0).toFixed(2) }, 20000); } catch (e) {}
    } catch (e) {
      console.error('Optimistic add failed locally', e);
    }
    // If user is not signed in (Guest), keep cart locally and skip backend call
    if (!activeUsername || activeUsername === 'Guest') {
      return true;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/add`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ username: activeUsername, productId }),
      });

      if (!res.ok) {
        // rollback optimistic update
        updateCartState(prevItems);
        removeProductFromCart?.(productId);
        return false;
      }

      return true;
    } catch (e) {
      console.error('Add to cart failed:', e);
      // rollback optimistic update
      updateCartState(prevItems);
      removeProductFromCart?.(productId);
      return false;
    }
  }, [getAuthHeaders, username, addProductToCart, removeProductFromCart, cartItems, updateCartState]);

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
        <section>
          <div className="relative w-full h-52 md:h-64 rounded-2xl overflow-hidden mb-8 shadow-lg">
            <img
              src="/landing-images/phones.avif"
              alt="Banner"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/55" />

            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                Hello, {username}!
              </h1>
              <p className="text-sm md:text-base text-white/90 max-w-xl">
                Discover products, manage your cart, and track every order with ease.
              </p>
            </div>
          </div>
        </section>

        <section className="shared-cart-access-section mb-8 rounded-2xl shadow-lg p-6 bg-white dark:bg-slate-900">
          <div className="shared-cart-access-header mb-4">
            <h2 className="text-xl font-semibold">Join a Shared Cart</h2>
            <p className="text-sm text-slate-500">Paste an invite link or share ID to collaborate on a cart with friends.</p>
          </div>

          <div className="shared-cart-access-form grid gap-3 md:grid-cols-[1fr_auto] items-end">
            <label className="block w-full">
              <span className="sr-only">Shared cart invite</span>
              <input
                type="text"
                value={sharedCartInvite}
                onChange={(event) => setSharedCartInvite(event.target.value)}
                placeholder="Enter invite link or share ID"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <button
              type="button"
              onClick={handleJoinSharedCart}
              disabled={sharedCartLoading}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sharedCartLoading ? 'Joining…' : 'Join Shared Cart'}
            </button>
          </div>

          {sharedCartError && (
            <p className="mt-3 text-sm text-rose-600">{sharedCartError}</p>
          )}
        </section>

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