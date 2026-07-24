export const ORDER_STATUS_SEQUENCE = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out For Delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
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

  return new Date(createdTime);
}

export function getCountdownLabel(createdAt, status) {
  const normalized = normalizeStatusText(status);
  if (normalized === 'cancelled') return 'Cancelled';
  if (normalized === 'delivered') return 'Delivered';
  return 'Backend status received';
}

export function getOrderHistoryEntries(orderId) {
  return [
    { key: 'placed', label: 'Order Placed', detail: `Order ${orderId} received successfully` },
    { key: 'confirmed', label: 'Confirmed', detail: 'Seller confirmed your order' },
    { key: 'packed', label: 'Packed', detail: 'Items packed and ready to ship' },
    { key: 'shipped', label: 'Shipped', detail: 'Courier picked up your package' },
    { key: 'out_for_delivery', label: 'Out For Delivery', detail: 'Courier is on the way' },
    { key: 'delivered', label: 'Delivered', detail: 'Package delivered successfully' },
  ];
}
