
import React, { useContext, useState, useCallback } from 'react';
import { ThemeContext } from './ThemeContext';
import './assets/styles.css';

export const ProductList = React.memo(({ products, onAddToCart, addedProductIds, error }) => {
  if (error) {
    return (
      <div className="product-empty-state product-empty-state--error">
        <h3 className="section-title">We could not load the products</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="product-empty-state">
        <div className="product-empty-state__icon" aria-hidden="true">📦</div>
        <h3 className="section-title">No products found in this category.</h3>
        <p>Try another category or clear the search to explore more products.</p>
        <button type="button" className="product-empty-state__button" onClick={() => window.location.reload()}>
          Browse All Products
        </button>
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="product-list-header">
        <div>
          <p className="section-eyebrow">Curated picks</p>
          <h3 className="section-title">{products.length} products ready to explore</h3>
        </div>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.product_id || product.id || product.productId}
            product={product}
            onAddToCart={onAddToCart}
            addedProductIds={addedProductIds}
          />
        ))}
      </div>
    </div>
  );
});

ProductList.displayName = 'ProductList';

const ProductCard = React.memo(({ product, onAddToCart, addedProductIds }) => {
  const imageUrl = product.images?.[0] && (product.images[0].startsWith("http") || product.images[0].startsWith("data:image/"))
    ? product.images[0]
    : (product.imageUrl || product.image || "/images/no-image.png");

  const { theme } = useContext(ThemeContext);
  const [active, setActive] = useState(false);
  const [optimistic, setOptimistic] = useState(false);
  const getId = (p) => {
    const raw = p.product_id ?? p.id ?? p.productId;
    return raw != null ? String(raw) : null;
  };
  const productId = getId(product);
  const isAdded = productId ? addedProductIds?.has(productId) : false;

  React.useEffect(() => {
    if (!isAdded) {
      setActive(false);
      setOptimistic(false);
    }
  }, [isAdded]);

  const handleClick = useCallback(async (e) => {
    // prevent parent/card click handlers from triggering add-to-cart
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

    const id = productId;
    if (!id || isAdded || optimistic) return;

    // optimistic UI: mark as added immediately
    setOptimistic(true);

    try {
      const success = await onAddToCart?.(product);
      if (!success) {
        // revert optimistic state on failure
        setOptimistic(false);
        return;
      }

      // show brief active animation even after optimistic set
      setActive(true);
      window.setTimeout(() => setActive(false), 1400);
    } catch (err) {
      setOptimistic(false);
    }
  }, [productId, onAddToCart, isAdded]);

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <img
          src={imageUrl}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/no-image.png";
          }}
        />
      </div>
      <div className="product-info">
        <div className="product-card-body">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">{product.description}</p>
          <div className="product-card-footer">
            <p className="product-price">₹{product.price}</p>
            <button
              type="button"
              className={`add-to-cart-btn ${(isAdded || active || optimistic) ? 'add-to-cart-btn--active' : ''}`}
              onClick={(e) => handleClick(e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick(e);
                }
              }}
              aria-label={(isAdded || optimistic) ? `${product.name} is already in cart` : `Add ${product.name} to cart`}
              disabled={isAdded || optimistic}
            >
              {(isAdded || optimistic) ? 'Added to Cart' : (active ? 'Added to Cart' : 'Add to Cart')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';