
import React from 'react';
import './assets/styles.css';

export const ProductList = React.memo(({ products, onAddToCart }) => {
  if (products.length === 0) {
    return (
      <div className="product-empty-state">
        <h3 className="section-title">No products available right now</h3>
        <p>Try a different category to see more picks.</p>
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
        <span className="section-pill">Fresh arrivals</span>
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