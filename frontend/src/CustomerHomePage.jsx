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
  const initialProducts = normalizeProductList(getCache('products_all') || []);
  const [allProducts, setAllProducts] = useState(initialProducts);
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Guest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  // New filter state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]); // numbers: 4,3,2,1 meaning >=
  const [selectedOffers, setSelectedOffers] = useState([]); // 'discount','special'
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [absoluteMinPrice, setAbsoluteMinPrice] = useState(0);
  const [absoluteMaxPrice, setAbsoluteMaxPrice] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState({ categories: true, rating: true, price: true, offers: true });
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);
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
      // build query params for filters
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);

      const url = `${import.meta.env.VITE_API_URL}/api/products${params.toString() ? `?${params.toString()}` : ''}`;

      const data = await cachedFetch(
        cacheKey,
        url,
        { credentials: 'include', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } },
        60000,
      );

      const productList = normalizeProductList(data);
      if (productList.length) {
        setAllProducts(productList);
        // compute price bounds on loaded products
        try {
          const prices = productList.map(p => Number(p.price ?? p.amount ?? 0)).filter(n => !Number.isNaN(n));
          const min = prices.length ? Math.min(...prices) : 0;
          const max = prices.length ? Math.max(...prices) : 0;
          setAbsoluteMinPrice(min);
          setAbsoluteMaxPrice(max);
          // initialize current range if not set
          setMinPrice((prev) => (prev === 0 ? min : prev));
          setMaxPrice((prev) => (prev === 0 ? max : prev));
        } catch (e) {}
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
  }, [getAuthHeaders, selectedCategory]);

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

  // derive dynamic filter options from products
  const categoryCounts = useMemo(() => {
    const counts = new Map();
    const products = Array.isArray(allProducts) ? allProducts : [];
    products.forEach((product) => {
      if (!product || typeof product !== 'object') return;
      const categories = [];
      if (product.category) categories.push(String(product.category).trim());
      if (product.categoryName) categories.push(String(product.categoryName).trim());
      if (product.categoryId) categories.push(String(product.categoryId).trim());
      if (product.category_id) categories.push(String(product.category_id).trim());
      if (Array.isArray(product.categories)) {
        product.categories.forEach((cat) => {
          if (cat) categories.push(String(cat).trim());
        });
      } else if (typeof product.categories === 'string') {
        categories.push(String(product.categories).trim());
      }
      categories.forEach((category) => {
        if (!category) return;
        counts.set(category, (counts.get(category) || 0) + 1);
      });
    });
    return counts;
  }, [allProducts]);

  const staticCategoryOptions = ['Shirts', 'Mobiles', 'Pants', 'Custom'];
  const availableCategories = useMemo(() => {
    const combined = new Set([...staticCategoryOptions, ...Array.from(categoryCounts.keys())]);
    return Array.from(combined).sort((a, b) => a.localeCompare(b));
  }, [categoryCounts]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase();
    const products = Array.isArray(allProducts) ? allProducts : [];

    return products.filter((product) => {
      if (!product || typeof product !== 'object') return false;
      const searchableText = [
        product.name,
        product.description,
        product.category,
        product.brand,
        product.categoryName,
        product.brandName,
        product.manufacturer,
        Array.isArray(product.categories) ? product.categories.join(' ') : product.categories,
        Array.isArray(product.brands) ? product.brands.join(' ') : product.brands,
      ].filter(Boolean).join(' ').toLowerCase();

      // search
      if (normalizedSearch && !searchableText.includes(normalizedSearch)) return false;

      const productCategories = [
        product.category,
        product.categoryName,
        product.categoryId,
        product.category_id,
        Array.isArray(product.categories) ? product.categories.join(' ') : product.categories,
      ].filter(Boolean).map((value) => String(value).toLowerCase());

      // category filter (OR within group)
      if (selectedCategories.length > 0) {
        const matchCat = selectedCategories.some((c) => productCategories.some((pc) => pc === String(c || '').toLowerCase()));
        if (!matchCat) return false;
      }

      // rating filter (OR within group but numeric threshold)
      if (selectedRatings.length > 0) {
        const prodRating = Number(product.rating ?? product.avgRating ?? product.averageRating ?? product.ratings ?? 0) || 0;
        const matchRating = selectedRatings.some((min) => prodRating >= Number(min));
        if (!matchRating) return false;
      }

      // offers
      if (selectedOffers.length > 0) {
        const hasDiscount = (() => {
          const price = Number(product.price ?? product.amount ?? 0) || 0;
          const mrp = Number(product.mrp ?? product.original_price ?? product.mrpPrice ?? product.mrp_price ?? 0) || 0;
          return mrp > 0 && mrp > price;
        })();
        const hasSpecial = Boolean(product.offer || product.offerText || product.specialOffer);
        const matchOffer = selectedOffers.some((o) => (o === 'discount' && hasDiscount) || (o === 'special' && hasSpecial));
        if (!matchOffer) return false;
      }

      // price range
      const price = Number(product.price ?? product.amount ?? 0) || 0;
      if (price < Number(minPrice) || price > Number(maxPrice)) return false;

      return true;
    });
  }, [allProducts, deferredSearchTerm, selectedCategories, selectedRatings, selectedOffers, minPrice, maxPrice]);

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

  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedRatings([]);
    setSelectedOffers([]);
    setMinPrice(absoluteMinPrice);
    setMaxPrice(absoluteMaxPrice);
    setFiltersPanelOpen(false);
  }, [absoluteMinPrice, absoluteMaxPrice]);

  const toggleCategory = useCallback((cat) => {
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  }, []);
  const toggleRating = useCallback((r) => {
    setSelectedRatings((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);
  }, []);
  const toggleOffer = useCallback((o) => {
    setSelectedOffers((prev) => prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]);
  }, []);

  const removeChip = useCallback((type, value) => {
    if (type === 'category') setSelectedCategories((p) => p.filter((x) => x !== value));
    if (type === 'rating') setSelectedRatings((p) => p.filter((x) => x !== value));
    if (type === 'offer') setSelectedOffers((p) => p.filter((x) => x !== value));
    if (type === 'price') {
      setMinPrice(absoluteMinPrice);
      setMaxPrice(absoluteMaxPrice);
    }
  }, [absoluteMinPrice, absoluteMaxPrice]);

  const toggleFiltersPanel = useCallback(() => {
    setFiltersPanelOpen((prev) => !prev);
  }, []);

  const closeFiltersPanel = useCallback(() => {
    setFiltersPanelOpen(false);
  }, []);

  return (
    <CustomerLayout username={username}>
      <div className="customer-home-content">
        {/* Sidebar */}
        {filtersPanelOpen && <div className="customer-home-filters-backdrop" onClick={closeFiltersPanel} />}
        <aside className={`customer-home-filters ${filtersPanelOpen ? 'customer-home-filters--open' : ''}`} aria-hidden={!filtersPanelOpen}>
          <div className="filters-header">
            <div>
              <h3>Filters</h3>
              <p className="filters-status">Tap any filter to refine products</p>
            </div>
            <div className="filters-actions">
              <button type="button" className="clear-filters" onClick={clearAllFilters}>Clear All</button>
              <button type="button" className="filter-panel-close" onClick={closeFiltersPanel} aria-label="Close filters">×</button>
            </div>
          </div>

          <div className="customer-home-filter-section">
            <button type="button" className="filter-section-toggle" onClick={() => setFiltersOpen((s) => ({ ...s, categories: !s.categories }))}>Categories</button>
            {filtersOpen.categories && (
              <div className="filter-options">
                {availableCategories.map((cat) => (
                  <label key={cat} className="customer-home-filter-option">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      aria-label={`Filter by ${cat}`}
                    />
                    <span>{cat}{categoryCounts.get(cat) ? ` (${categoryCounts.get(cat)})` : ''}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="customer-home-filter-section">
            <button type="button" className="filter-section-toggle" onClick={() => setFiltersOpen((s) => ({ ...s, rating: !s.rating }))}>Customer Rating</button>
            {filtersOpen.rating && (
              <div className="filter-options">
                {[4,3,2,1].map((r) => (
                  <label key={r} className="customer-home-filter-option">
                    <input type="checkbox" checked={selectedRatings.includes(r)} onChange={() => toggleRating(r)} />
                    <span>{r}★ & above</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="customer-home-filter-section">
            <button type="button" className="filter-section-toggle" onClick={() => setFiltersOpen((s) => ({ ...s, offers: !s.offers }))}>Offers</button>
            {filtersOpen.offers && (
              <div className="filter-options">
                <label className="customer-home-filter-option">
                  <input type="checkbox" checked={selectedOffers.includes('discount')} onChange={() => toggleOffer('discount')} />
                  <span>Discount available</span>
                </label>
                <label className="customer-home-filter-option">
                  <input type="checkbox" checked={selectedOffers.includes('special')} onChange={() => toggleOffer('special')} />
                  <span>Special offer</span>
                </label>
              </div>
            )}
          </div>

          <div className="customer-home-filter-section">
            <button type="button" className="filter-section-toggle" onClick={() => setFiltersOpen((s) => ({ ...s, price: !s.price }))}>Price</button>
            {filtersOpen.price && (
              <div className="filter-options customer-home-price-filter">
                <div className="price-range-values">
                  <span>₹{minPrice}</span>
                  <span>₹{maxPrice}</span>
                </div>
                <div className="price-slider">
                  <input type="range" min={absoluteMinPrice} max={absoluteMaxPrice} value={minPrice} onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v <= maxPrice) setMinPrice(v);
                    else setMinPrice(maxPrice);
                  }} />
                  <input type="range" min={absoluteMinPrice} max={absoluteMaxPrice} value={maxPrice} onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= minPrice) setMaxPrice(v);
                    else setMaxPrice(minPrice);
                  }} />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Results area */}
        <main className="customer-home-results">
          <section className="mb-6 results-header">
            <div className="results-top">
              <div className="search-and-filter">
                <div className="search-container">
                  <button
                    className={`mobile-filters-btn filters-toggle-button ${filtersPanelOpen ? 'filters-toggle-button--active' : ''}`}
                    type="button"
                    onClick={toggleFiltersPanel}
                    aria-pressed={filtersPanelOpen}
                  >
                    <span className="filters-btn-icon" aria-hidden="true">⟁</span>
                    Filters
                  </button>
                  <span className="search-icon" aria-hidden="true">🔍</span>
                  <input
                    id="product-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products by name, description or category"
                    aria-label="Search products"
                    className="search-input"
                  />
                </div>

              {/* filter chips */}
              <div className="filter-chips">
                {selectedCategories.map((c) => (
                  <button key={`chip-cat-${c}`} className="customer-home-filter-chip" onClick={() => removeChip('category', c)}>{c} ×</button>
                ))}
                {selectedRatings.map((r) => (
                  <button key={`chip-rating-${r}`} className="customer-home-filter-chip" onClick={() => removeChip('rating', r)}>{r}★ ×</button>
                ))}
                {selectedOffers.map((o) => (
                  <button key={`chip-offer-${o}`} className="customer-home-filter-chip" onClick={() => removeChip('offer', o)}>{o === 'discount' ? 'Discount' : 'Special'} ×</button>
                ))}
                {(minPrice !== absoluteMinPrice || maxPrice !== absoluteMaxPrice) && (
                  <button className="customer-home-filter-chip" onClick={() => removeChip('price')}>₹{minPrice} - ₹{maxPrice} ×</button>
                )}
              </div>
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
            <ProductList products={filteredProducts} onAddToCart={handleAddToCart} addedProductIds={addedProductIds} error={error} />
          )}
        </main>
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