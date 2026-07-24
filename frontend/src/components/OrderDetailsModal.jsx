import React from 'react';

const formatCurrency = (value) => {
  const numericValue = Number(value ?? 0);
  return Number.isNaN(numericValue) ? '₹0.00' : `₹${numericValue.toFixed(2)}`;
};

export default function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  const orderId = order.orderId || order.order_id || order.id || 'N/A';
  const customerName = order.customerName || order.customer_name || order.name || 'Customer';
  const email = order.email || order.customerEmail || 'N/A';
  const phone = order.phone || order.mobile || 'N/A';
  const address = order.address || order.deliveryAddress || 'Delivery address on file';
  const productName = order.name || order.productName || 'Product';
  const imageUrl = order.imageUrl || order.image_url || 'https://via.placeholder.com/120';
  const quantity = Number(order.quantity ?? order.qty ?? 1);
  const price = Number(order.price || order.price_per_unit || 0);
  const total = Number(order.totalAmount || order.total_price || order.total || order.amount || 0);
  const paymentMethod = order.paymentMethod || order.payment_method || 'Razorpay';
  const paymentStatus = order.paymentStatus || order.payment_status || 'Paid';
  const orderStatus = order.status || order.orderStatus || 'Order Placed';
  const orderDate = order.orderDate || order.createdAt || order.created_at || new Date().toLocaleString('en-IN');

  return (
    <div className="order-details-overlay" onClick={onClose}>
      <div className="order-details-modal" onClick={(event) => event.stopPropagation()}>
        <div className="order-details-modal__header">
          <div>
            <p className="order-details-modal__eyebrow">Order details</p>
            <h3>{orderId}</h3>
          </div>
          <button className="order-details-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="order-details-modal__body">
          <div className="order-details-modal__product">
            <img src={imageUrl} alt={productName} />
            <div>
              <h4>{productName}</h4>
              <p>Quantity: {quantity}</p>
              <p>Price per unit: {formatCurrency(price)}</p>
            </div>
          </div>

          <div className="order-details-modal__grid">
            <div><span>Order Number</span><strong>{orderId}</strong></div>
            <div><span>Customer</span><strong>{customerName}</strong></div>
            <div><span>Email</span><strong>{email}</strong></div>
            <div><span>Phone</span><strong>{phone}</strong></div>
            <div><span>Address</span><strong>{address}</strong></div>
            <div><span>Payment Method</span><strong>{paymentMethod}</strong></div>
            <div><span>Payment Status</span><strong>{paymentStatus}</strong></div>
            <div><span>Order Status</span><strong>{orderStatus}</strong></div>
            <div><span>Order Date</span><strong>{orderDate}</strong></div>
            <div><span>Subtotal</span><strong>{formatCurrency(total)}</strong></div>
            <div><span>Delivery Charges</span><strong>{formatCurrency(order.deliveryCharges || 0)}</strong></div>
            <div><span>Tax</span><strong>{formatCurrency(order.tax || 0)}</strong></div>
            <div><span>Grand Total</span><strong>{formatCurrency(total)}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
