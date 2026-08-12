
import React, { useContext, useState, useCallback } from 'react';
import { ThemeContext } from './ThemeContext';
import './assets/styles.css';

export const ProductList = React.memo(({ products, onAddToCart, addedProductIds, onViewProduct, error }) => {
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
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.product_id || product.id || product.productId}
            product={product}
            onAddToCart={onAddToCart}
            onViewProduct={onViewProduct}
            addedProductIds={addedProductIds}
          />
        ))}
      </div>
    </div>
  );
});

ProductList.displayName = 'ProductList';

const ProductCard = React.memo(({ product, onAddToCart, onViewProduct, addedProductIds }) => {
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
    <div
      className="product-card"
      role={onViewProduct ? 'button' : undefined}
      tabIndex={onViewProduct ? 0 : undefined}
      onClick={() => onViewProduct?.(product)}
      onKeyDown={(e) => {
        if (!onViewProduct) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewProduct(product);
        }
      }}
    >
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
            <h3 className="product-name" style={{ margin: 0 }}>{product.name}</h3>
            {/* rating display: always show star icon; show numeric value when available */}
            {(() => {
              const val = product.rating ?? product.avgRating ?? product.averageRating ?? product.ratingAverage ?? product.ratings ?? null;
              const hasRating = val !== null && val !== undefined && val !== '';
              const num = hasRating ? (Number(val) || 0) : null;
              return (
                <div className="product-rating" aria-label={hasRating ? `Rated ${num} out of 5` : 'No rating yet'}>
                  {hasRating ? (
                    <span className="rating-number">{num % 1 === 0 ? num.toFixed(1) : num.toFixed(1)}</span>
                  ) : (
                    <span className="rating-number">★</span>
                  )}
                  <svg className="rating-star" viewBox="0 0 24 24" width="14" height="14" aria-hidden>
                    <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.557L19.335 24 12 19.897 4.665 24l1.636-8.693L.6 9.75l7.732-1.732L12 .587z"/>
                  </svg>
                </div>
              );
            })()}
          </div>
          <p className="product-description">{product.description}</p>
          <div className="product-card-footer">
            <div>
              <div className="product-price">
                <span className="current-price">₹{product.price ?? product.amount ?? '0'}</span>
                {(() => {
                  const mrp = product.mrp ?? product.original_price ?? product.mrpPrice ?? product.mrp_price;
                  if (mrp) {
                    const priceNum = Number(product.price ?? product.amount ?? 0) || 0;
                    const mrpNum = Number(mrp) || 0;
                    const discount = mrpNum > 0 ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0;
                    return (
                      <>
                        <span className="mrp">₹{mrp}</span>
                        {discount > 0 && <span className="discount">{discount}% off</span>}
                      </>
                    );
                  }
                  return null;
                })()}
              </div>
              {product.offer || product.offerText || product.specialOffer ? (
                <div className="product-offer">{product.offer || product.offerText || product.specialOffer}</div>
              ) : null}
            </div>

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