import React from 'react';

const statusClassMap = {
  placed: 'status-badge--placed',
  shipped: 'status-badge--shipped',
  transit: 'status-badge--transit',
  delivered: 'status-badge--delivered',
};

export default function StatusBadge({ status }) {
  const normalized = (status || 'placed').toLowerCase();
  const className = `status-badge ${statusClassMap[normalized] || 'status-badge--placed'}`;

  return <span className={className}>{status || 'Order Placed'}</span>;
}
