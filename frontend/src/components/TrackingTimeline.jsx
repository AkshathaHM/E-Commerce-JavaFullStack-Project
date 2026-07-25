import React, { memo } from 'react';

const defaultSteps = [
  { key: 'placed', label: 'Order Placed', detail: 'We have received your order.' },
  { key: 'confirmed', label: 'Confirmed', detail: 'Your order is approved and being prepared.' },
  { key: 'packed', label: 'Packed', detail: 'The items are packed and secured.' },
  { key: 'shipped', label: 'Shipped', detail: 'The courier has picked up your parcel.' },
  { key: 'out_for_delivery', label: 'Out For Delivery', detail: 'The courier is heading your way.' },
  { key: 'delivered', label: 'Delivered', detail: 'Your order has reached its destination.' },
  { key: 'cancelled', label: 'Cancelled', detail: 'The order was cancelled successfully.' },
];

const normalizeStatus = (status) => {
  const text = typeof status === 'string' ? status.trim().toLowerCase() : 'placed';
  if (text.includes('cancel')) return 'cancelled';
  if (text.includes('delivered')) return 'delivered';
  if (text.includes('out for delivery') || text.includes('out_for_delivery') || text.includes('out for') || text.includes('delivery')) return 'out_for_delivery';
  if (text.includes('packed')) return 'packed';
  if (text.includes('confirmed')) return 'confirmed';
  if (text.includes('shipped')) return 'shipped';
  if (text.includes('order_placed') || text.includes('placed')) return 'placed';
  return 'placed';
};

function TrackingTimeline({ currentStatus, steps = defaultSteps }) {
  const normalized = normalizeStatus(currentStatus);
  const currentIndex = steps.findIndex((step) => step.key === normalized);
  const safeIndex = currentIndex >= 0 ? currentIndex : steps.length - 1;

  return (
    <div className="tracking-timeline" aria-label="Order tracking timeline">
      {steps.map((step, index) => {
        // If order is delivered, treat delivered step as completed as well (show ticks for all steps)
        const isDelivered = normalized === 'delivered';
        const isCompleted = index < safeIndex || (isDelivered && index <= safeIndex);
        const isActive = index === safeIndex;
        // don't show 'active' styling when the step is already completed (e.g., delivered)
        const showActive = isActive && !isCompleted;
        const isCancelled = normalized === 'cancelled' && step.key === 'cancelled';

        return (
          <div key={step.key} className={`timeline-step-wrapper ${isCompleted ? 'timeline-step-wrapper--complete' : ''} ${isCancelled ? 'timeline-step-wrapper--cancelled' : ''}`}>
            <div className={`timeline-step ${isCompleted ? 'timeline-step--complete' : ''} ${showActive ? 'timeline-step--active' : ''} ${isCancelled ? 'timeline-step--cancelled' : ''}`}>
              <div className="timeline-icon" aria-hidden>
                {isCompleted ? '✓' : isCancelled ? '✕' : index + 1}
              </div>
            </div>
            <div className="timeline-content">
              <div className="timeline-label">{step.label}</div>
              <div className="timeline-detail">{step.detail}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(TrackingTimeline);
