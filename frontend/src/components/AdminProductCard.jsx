import React, { memo } from 'react';

function AdminProductCard({ product, onViewProduct, onEditProduct, onDeleteProduct, getPreviewImage, getDisplayName, getDisplayDescription }) {
  const preview = getPreviewImage(product);
  const name = getDisplayName(product);
  const desc = getDisplayDescription(product);

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <img src={preview} alt={name} className="product-image" loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/no-image.png"; }} />
      </div>
      <div className="product-info">
        <div className="product-card-body">
          <div className="product-card-heading">
            <h3 className="product-name">{name}</h3>
            <span className={`product-card-status ${((product.status||"") + "").toLowerCase().includes("inactive") ? 'product-card-status--inactive' : ''}`}>{product.status || "Active"}</span>
          </div>
          <p className="product-description">{desc}</p>
          <div className="admin-product-meta">
            <span><strong>ID</strong><span className="meta-value">{product.product_id || product.productId || product.id}</span></span>
            <span><strong>Category</strong><span className="meta-value">{product.category || product.categoryName || "—"}</span></span>
            <span><strong>Price</strong><span className="meta-value">₹{Number(product.price || product.amount || 0).toLocaleString()}</span></span>
            <span><strong>Stock</strong><span className="meta-value">{product.stock || product.quantity || 0}</span></span>
            <span><strong>Status</strong><span className="meta-value">{product.status || "Active"}</span></span>
            <span><strong>Brand</strong><span className="meta-value">{product.brand || product.manufacturer || "—"}</span></span>
          </div>
        </div>
        <div className="product-card-footer admin-product-actions">
          <button type="button" className="product-view-btn" onClick={() => onViewProduct && onViewProduct(product)}>View</button>
          <button type="button" className="add-to-cart-btn" onClick={() => onEditProduct && onEditProduct(product)} aria-label={`Update ${name}`}>Update</button>
          <button type="button" className="product-delete-btn" onClick={() => onDeleteProduct && onDeleteProduct(product)}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default memo(AdminProductCard);
