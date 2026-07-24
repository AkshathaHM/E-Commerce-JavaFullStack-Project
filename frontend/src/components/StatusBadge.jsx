import React from 'react';

const statusClassMap = {
  placed: 'status-badge--placed',
  shipped: 'status-badge--shipped',
  transit: 'status-badge--transit',
  delivered: 'status-badge--delivered',
};

const normalizeStatus = (status) => {
  const text = typeof status === 'string' ? status.trim().toLowerCase() : 'placed';
  if (text.includes('delivered')) return 'delivered';
  if (text.includes('transit')) return 'transit';
  if (text.includes('shipped')) return 'shipped';
  return 'placed';
};

export default function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);
  const className = `status-badge ${statusClassMap[normalized] || 'status-badge--placed'}`;
  const label = normalized === 'delivered' ? 'Delivered' : normalized === 'transit' ? 'In Transit' : normalized === 'shipped' ? 'Shipped' : 'Order Placed';

  return <span className={className}>{label}</span>;
}
