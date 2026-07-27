import React, { memo } from 'react';

const CartItem = ({ item, onIncrease, onDecrease, onRemove, getItemId, imageFallback = '/images/no-image.png' }) => {
  const id = getItemId(item) || item.id || item.productId || item.product_id;
  const image = (item.display_image_url || item.image_url || item.image || '').startsWith?.('http') ? (item.display_image_url || item.image_url || item.image) : imageFallback;

  const stockLimit = item?.stock ?? item?.availableStock ?? item?.available_stock ?? item?.maxQuantity ?? item?.max_quantity ?? item?.quantityAvailable ?? item?.quantity_available ?? item?.inventory ?? item?.product_stock ?? null;
  const numericStockLimit = Number.isFinite(Number(stockLimit)) ? Number(stockLimit) : null;
  const canDecrease = Number(item.quantity || 0) > 1;
  const canIncrease = numericStockLimit === null || Number(item.quantity || 0) < numericStockLimit;

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
            <button onClick={() => onDecrease(id)} disabled={!canDecrease}>−</button>
            <span className="quantity-display">{item.quantity}</span>
            <button onClick={() => onIncrease(id)} disabled={!canIncrease}>+</button>
          </div>

          <span className="price">₹{item.total_price}</span>

          <button className="remove-btn" onClick={() => onRemove(id)} aria-label="Remove item">
            🗑
          </button>
        </div>
        {numericStockLimit !== null && (
          <div className="item-stock-hint">
            {`In stock: ${numericStockLimit}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(CartItem);
