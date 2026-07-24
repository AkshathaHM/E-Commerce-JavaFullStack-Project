import React from 'react';

const statusClassMap = {
  placed: 'status-badge--placed',
  shipped: 'status-badge--shipped',
  transit: 'status-badge--transit',
  delivered: 'status-badge--delivered',
};

const normalizeStatus = (status) => {
  const text = typeof status === 'string' ? status.trim().toLowerCase() : 'placed';
  if (text.includes('cancel')) return 'cancelled';
  if (text.includes('delivered')) return 'delivered';
  if (text.includes('out for delivery') || text.includes('out_for_delivery') || text.includes('out for')) return 'transit';
  if (text.includes('packed')) return 'packed';
  if (text.includes('confirmed')) return 'confirmed';
  if (text.includes('shipped')) return 'shipped';
  return 'placed';
};

export default function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);
  const className = `status-badge ${statusClassMap[normalized] || 'status-badge--placed'}`;
  const label = normalized === 'cancelled'
    ? 'Cancelled'
    : normalized === 'delivered'
      ? 'Delivered'
      : normalized === 'transit'
        ? 'Out For Delivery'
        : normalized === 'shipped'
          ? 'Shipped'
          : normalized === 'packed'
            ? 'Packed'
            : normalized === 'confirmed'
              ? 'Confirmed'
              : 'Order Placed';

  return <span className={className}>{label}</span>;
}
