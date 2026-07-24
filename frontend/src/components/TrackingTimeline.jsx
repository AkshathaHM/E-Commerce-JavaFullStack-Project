import React from 'react';

const defaultSteps = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out For Delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const normalizeStatus = (status) => {
  const text = typeof status === 'string' ? status.trim().toLowerCase() : 'placed';
  if (text.includes('cancel')) return 'cancelled';
  if (text.includes('delivered')) return 'delivered';
  if (text.includes('out for delivery') || text.includes('out_for_delivery') || text.includes('delivery')) return 'out_for_delivery';
  if (text.includes('packed')) return 'packed';
  if (text.includes('confirmed')) return 'confirmed';
  if (text.includes('shipped')) return 'shipped';
  return 'placed';
};

export default function TrackingTimeline({ currentStatus, steps = defaultSteps }) {
  const normalized = normalizeStatus(currentStatus);
  const currentIndex = steps.findIndex((step) => step.key === normalized);
  const safeIndex = currentIndex >= 0 ? currentIndex : steps.length - 1;

  return (
    <div className="tracking-timeline" aria-label="Order tracking timeline">
      {steps.map((step, index) => {
        const isCompleted = index < safeIndex;
        const isActive = index === safeIndex;
        const isCancelled = normalized === 'cancelled' && step.key === 'cancelled';

        return (
          <div key={step.key} className="timeline-step-wrapper">
            {index > 0 && <div className={`timeline-line ${isCompleted ? 'timeline-line--active' : ''}`} />}
            <div className={`timeline-step ${isCompleted ? 'timeline-step--complete' : ''} ${isActive ? 'timeline-step--active' : ''} ${isCancelled ? 'timeline-step--cancelled' : ''}`}>
              <div className="timeline-icon">
                {isCompleted ? '✓' : isCancelled ? '✕' : index + 1}
              </div>
              <div className="timeline-label">{step.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
