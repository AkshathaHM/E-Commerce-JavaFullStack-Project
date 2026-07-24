import React from 'react';

export default function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="order-details-overlay" onClick={onClose}>
      <div className="order-details-modal" onClick={(event) => event.stopPropagation()}>
        <div className="order-details-modal__header">
          <div>
            <p className="order-details-modal__eyebrow">Order details</p>
            <h3>{order.orderId || order.order_id || 'Order Details'}</h3>
          </div>
          <button className="order-details-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="order-details-modal__body">
          <div className="order-details-modal__product">
            <img src={order.imageUrl || order.image_url || 'https://via.placeholder.com/120'} alt={order.name || 'Product'} />
            <div>
              <h4>{order.name || 'Product Name'}</h4>
              <p>Quantity: {order.quantity || 1}</p>
              <p>Price: ₹{Number(order.price || order.price_per_unit || 0).toFixed(2)}</p>
            </div>
          </div>

          <div className="order-details-modal__grid">
            <div><span>Subtotal</span><strong>₹{Number(order.subtotal || order.total_price || 0).toFixed(2)}</strong></div>
            <div><span>Delivery Charges</span><strong>₹{Number(order.deliveryCharges || 0).toFixed(2)}</strong></div>
            <div><span>Tax</span><strong>₹{Number(order.tax || 0).toFixed(2)}</strong></div>
            <div><span>Grand Total</span><strong>₹{Number(order.totalAmount || order.total_price || 0).toFixed(2)}</strong></div>
          </div>

          <div className="order-details-modal__meta">
            <p><strong>Payment Method:</strong> {order.paymentMethod || 'Razorpay'}</p>
            <p><strong>Order Date:</strong> {order.orderDate || new Date().toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
