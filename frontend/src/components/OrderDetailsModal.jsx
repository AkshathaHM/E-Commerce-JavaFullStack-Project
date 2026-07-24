import React, { useEffect, useMemo } from 'react';

const FALLBACK_IMAGE = '/images/no-image.png';
const EMPTY_LABEL = 'N/A';

const formatCurrency = (value) => {
  const numericValue = Number(value ?? 0);
  return Number.isNaN(numericValue) ? '₹0.00' : `₹${numericValue.toFixed(2)}`;
};

const getSafeText = (value, fallback = EMPTY_LABEL) => {
  if (value === null || value === undefined || value === '') return fallback;
  const text = String(value).trim();
  return text || fallback;
};

const getSafeImage = (image) => {
  if (!image || typeof image !== 'string') return FALLBACK_IMAGE;
  const trimmed = image.trim();
  if (!trimmed || trimmed.includes('via.placeholder.com')) return FALLBACK_IMAGE;
  return trimmed;
};

export default function OrderDetailsModal({ order, onClose }) {
  useEffect(() => {
    if (!order) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, order]);

  const modalData = useMemo(() => {
    if (!order) return null;

    const orderId = getSafeText(order.orderId || order.order_id || order.id);
    const customerName = getSafeText(order.customerName || order.customer_name || order.name);
    const email = getSafeText(order.email || order.customerEmail);
    const phone = getSafeText(order.phone || order.mobile);
    const address = getSafeText(order.address || order.deliveryAddress);
    const productName = getSafeText(order.name || order.productName);
    const productId = getSafeText(order.productId || order.product_id);
    const category = getSafeText(order.category || order.productCategory);
    const imageUrl = getSafeImage(order.imageUrl || order.image_url || order.image);
    const quantity = Number(order.quantity ?? order.qty ?? 0);
    const price = Number(order.price || order.price_per_unit || 0);
    const total = Number(order.totalAmount || order.total_price || order.total || order.amount || 0);
    const deliveryCharges = Number(order.deliveryCharges || order.delivery_charge || 0);
    const tax = Number(order.tax || order.totalTax || 0);
    const paymentMethod = getSafeText(order.paymentMethod || order.payment_method);
    const paymentStatus = getSafeText(order.paymentStatus || order.payment_status);
    const orderStatus = getSafeText(order.status || order.orderStatus);
    const orderDate = getSafeText(order.orderDate || order.createdAt || order.created_at || new Date().toLocaleString('en-IN'));
    const grandTotal = Number(total + deliveryCharges + tax);

    return {
      orderId,
      customerName,
      email,
      phone,
      address,
      productName,
      productId,
      category,
      imageUrl,
      quantity,
      price,
      total,
      deliveryCharges,
      tax,
      paymentMethod,
      paymentStatus,
      orderStatus,
      orderDate,
      grandTotal,
    };
  }, [order]);

  if (!order || !modalData) return null;

  return (
    <div className="order-details-overlay" onClick={onClose}>
      <div className="order-details-modal" onClick={(event) => event.stopPropagation()}>
        <div className="order-details-modal__header">
          <div>
            <p className="order-details-modal__eyebrow">Order details</p>
            <h3>{modalData.orderId}</h3>
          </div>
          <button className="order-details-modal__close" type="button" onClick={onClose} aria-label="Close order details modal">
            ×
          </button>
        </div>

        <div className="order-details-modal__body">
          <div className="order-details-modal__product">
            <img
              src={modalData.imageUrl}
              alt={modalData.productName}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
            <div>
              <h4>{modalData.productName}</h4>
              <p>Quantity: {modalData.quantity || EMPTY_LABEL}</p>
              <p>Price per unit: {formatCurrency(modalData.price)}</p>
            </div>
          </div>

          <div className="order-details-modal__grid">
            <div><span>Customer Name</span><strong>{modalData.customerName}</strong></div>
            <div><span>Email</span><strong>{modalData.email}</strong></div>
            <div><span>Phone</span><strong>{modalData.phone}</strong></div>
            <div><span>Delivery Address</span><strong>{modalData.address}</strong></div>
            <div><span>Order Number</span><strong>{modalData.orderId}</strong></div>
            <div><span>Order Date</span><strong>{modalData.orderDate}</strong></div>
            <div><span>Order Status</span><strong>{modalData.orderStatus}</strong></div>
            <div><span>Payment Status</span><strong>{modalData.paymentStatus}</strong></div>
            <div><span>Payment Method</span><strong>{modalData.paymentMethod}</strong></div>
            <div><span>Quantity</span><strong>{modalData.quantity || EMPTY_LABEL}</strong></div>
            <div><span>Total</span><strong>{formatCurrency(modalData.total)}</strong></div>
            <div><span>Delivery Charge</span><strong>{formatCurrency(modalData.deliveryCharges)}</strong></div>
            <div><span>Tax</span><strong>{formatCurrency(modalData.tax)}</strong></div>
            <div><span>Grand Total</span><strong>{formatCurrency(modalData.grandTotal)}</strong></div>
            <div><span>Product Name</span><strong>{modalData.productName}</strong></div>
            <div><span>Product ID</span><strong>{modalData.productId}</strong></div>
            <div><span>Category</span><strong>{modalData.category}</strong></div>
            <div><span>Price</span><strong>{formatCurrency(modalData.price)}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
