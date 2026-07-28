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
  if (text.includes('out for delivery') || text.includes('out_for_delivery') || text.includes('out for')) return 'out_for_delivery';
  if (text.includes('packed')) return 'packed';
  if (text.includes('confirmed')) return 'confirmed';
  if (text.includes('shipped')) return 'shipped';
  if (text.includes('delivered')) return 'delivered';
  if (text.includes('placed') || text.includes('order placed')) return 'placed';
  return 'placed';
};

export const getOrderStatus = (createdAt) => {
  if (!createdAt) {
    return 'Order Placed';
  }

  const created = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(created.getTime())) {
    return 'Order Placed';
  }

  const now = new Date();
  const diffInHours = (now - created) / (1000 * 60 * 60);

  if (!Number.isFinite(diffInHours) || diffInHours < 0) {
    return 'Order Placed';
  }

  if (diffInHours < 1) return 'Order Placed';
  if (diffInHours < 2) return 'Confirmed';
  if (diffInHours < 3) return 'Packed';
  if (diffInHours < 4) return 'Shipped';
  if (diffInHours < 5) return 'Out For Delivery';
  return 'Delivered';
};

export function getDerivedOrderStatus(createdAt, rawStatus = '') {
  const normalized = normalizeStatusText(rawStatus);
  if (normalized === 'cancelled') {
    return 'cancelled';
  }

  const label = getOrderStatus(createdAt);
  return normalizeStatusText(label);
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

export function getExpectedDelivery(createdAt, status = '') {
  const createdTime = new Date(createdAt || new Date().toISOString()).getTime();
  if (Number.isNaN(createdTime)) {
    return new Date();
  }

  const normalized = normalizeStatusText(status);
  // Map status to estimated remaining hours from creation
  const totalHoursMap = {
    placed: 5,
    confirmed: 5,
    packed: 5,
    shipped: 5,
    out_for_delivery: 5,
    delivered: 5,
    cancelled: 0,
  };

  const totalHours = totalHoursMap[normalized] ?? 5;
  const delivery = new Date(createdTime);
  delivery.setHours(delivery.getHours() + totalHours);
  return delivery;
}

export function getCountdownLabel(createdAt, status) {
  const normalized = normalizeStatusText(status);
  if (normalized === 'cancelled') return 'Cancelled';
  if (normalized === 'delivered') return 'Delivered';
  return 'Expected within 5 hours';
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

