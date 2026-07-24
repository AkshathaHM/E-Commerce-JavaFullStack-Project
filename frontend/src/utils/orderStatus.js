export const ORDER_STATUS_SEQUENCE = [
  { key: 'placed', label: 'Order Placed', detail: 'Your order has been received and is being prepared.' },
  { key: 'confirmed', label: 'Confirmed', detail: 'The merchant confirmed your order and prepared the shipment.' },
  { key: 'packed', label: 'Packed', detail: 'Items were packed securely and are ready for dispatch.' },
  { key: 'shipped', label: 'Shipped', detail: 'The courier collected your package for delivery.' },
  { key: 'out_for_delivery', label: 'Out For Delivery', detail: 'The courier is on the way with your delivery.' },
  { key: 'delivered', label: 'Delivered', detail: 'The package reached you successfully.' },
  { key: 'cancelled', label: 'Cancelled', detail: 'The order was cancelled before it was dispatched.' },
];

const normalizeStatusText = (status) => {
  const text = typeof status === 'string' ? status.trim().toLowerCase() : '';
  if (!text) return 'placed';
  if (text.includes('cancel')) return 'cancelled';
  if (text.includes('delivered')) return 'delivered';
  if (text.includes('out for delivery') || text.includes('out_for_delivery') || text.includes('out for')) return 'out_for_delivery';
  if (text.includes('packed')) return 'packed';
  if (text.includes('confirmed')) return 'confirmed';
  if (text.includes('shipped')) return 'shipped';
  if (text.includes('placed')) return 'placed';
  return 'placed';
};

export function getDerivedOrderStatus(createdAt, rawStatus = '') {
  return normalizeStatusText(rawStatus);
}

export function getStatusLabel(status) {
  const normalized = normalizeStatusText(status);
  if (normalized === 'cancelled') return 'Cancelled';
  if (normalized === 'out_for_delivery') return 'Out For Delivery';
  if (normalized === 'confirmed') return 'Confirmed';
  if (normalized === 'packed') return 'Packed';
  if (normalized === 'shipped') return 'Shipped';
  if (normalized === 'delivered') return 'Delivered';
  return 'Order Placed';
}

export function getExpectedDelivery(createdAt) {
  const createdTime = new Date(createdAt || new Date().toISOString()).getTime();
  if (Number.isNaN(createdTime)) {
    return new Date();
  }

  const delivery = new Date(createdTime);
  delivery.setDate(delivery.getDate() + 4);
  return delivery;
}

export function getCountdownLabel(createdAt, status) {
  const normalized = normalizeStatusText(status);
  if (normalized === 'cancelled') return 'Cancelled';
  if (normalized === 'delivered') return 'Delivered';
  return 'Estimated delivery in 4 days';
}

export function getOrderHistoryEntries(orderId) {
  return [
    { key: 'placed', label: 'Order Placed', detail: `Order ${orderId} was received successfully.` },
    { key: 'confirmed', label: 'Confirmed', detail: 'The seller confirmed your order and inventory.' },
    { key: 'packed', label: 'Packed', detail: 'Items were packed and sealed for dispatch.' },
    { key: 'shipped', label: 'Shipped', detail: 'The courier picked up your package.' },
    { key: 'out_for_delivery', label: 'Out For Delivery', detail: 'The courier is on the way to your address.' },
    { key: 'delivered', label: 'Delivered', detail: 'The package was delivered successfully.' },
  ];
}
