import React, { memo } from 'react';

const CartItem = ({ item, onIncrease, onDecrease, onRemove, getItemId, imageFallback = '/images/no-image.png' }) => {
  const id = getItemId(item) || item.id || item.productId || item.product_id;
  const image = (item.display_image_url || item.image_url || item.image || '').startsWith?.('http') ? (item.display_image_url || item.image_url || item.image) : imageFallback;

  return (
    <div className="cart-item">
      <img src={image} alt={item.display_name || item.name || 'Product'} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = imageFallback; }} />
      <div className="item-details">
        <div className="item-info">
          <h3>{item.display_name || item.name}</h3>
          <p>{item.display_description || item.description}</p>
        </div>

        <div className="item-actions">
          <div className="quantity-controls">
            <button onClick={() => onDecrease(id)} disabled={item.quantity <= 1}>−</button>
            <span className="quantity-display">{item.quantity}</span>
            <button onClick={() => onIncrease(id)}>+</button>
          </div>

          <span className="price">₹{item.total_price}</span>

          <button className="remove-btn" onClick={() => onRemove(id)} aria-label="Remove item">
            🗑
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(CartItem);
