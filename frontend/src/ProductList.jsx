
import React from 'react';
import './assets/styles.css';

export const ProductList = React.memo(({ products, onAddToCart, error }) => {
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
        {products.map((product, index) => (
          <ProductCard key={product.product_id} product={product} index={index} onAddToCart={onAddToCart} />
        ))}
      </div>
    </div>
  );
});

ProductList.displayName = 'ProductList';

const ProductCard = React.memo(({ product, index, onAddToCart }) => {
  const imageUrl = product.images?.[0] && (product.images[0].startsWith("http") || product.images[0].startsWith("data:image/")) 
    ? product.images[0] 
    : "/images/no-image.png";

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
        <div className="product-card-meta">
          <span className="product-chip">{index % 2 === 0 ? 'Popular' : 'Trending'}</span>
          <span className="product-chip secondary">In stock</span>
        </div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <p className="product-price">₹{product.price}</p>
        <button
          className="add-to-cart-btn"
          onClick={() => onAddToCart(product.product_id)}
          aria-label={`Add ${product.name} to cart`}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';