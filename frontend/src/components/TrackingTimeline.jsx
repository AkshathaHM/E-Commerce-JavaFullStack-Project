import React from 'react';

const stepSequence = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
];

export default function TrackingTimeline({ currentStatus }) {
  const normalized = (currentStatus || 'placed').toLowerCase();
  const currentIndex = stepSequence.findIndex((step) => step.key === normalized);

  return (
    <div className="tracking-timeline" aria-label="Order tracking timeline">
      {stepSequence.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const isDelivered = normalized === 'delivered' && index === stepSequence.length - 1;

        return (
          <div key={step.key} className="timeline-step-wrapper">
            {index > 0 && <div className={`timeline-line ${isCompleted ? 'timeline-line--active' : ''}`} />}
            <div className={`timeline-step ${isCompleted ? 'timeline-step--complete' : ''} ${isActive ? 'timeline-step--active' : ''} ${isDelivered ? 'timeline-step--delivered' : ''}`}>
              <div className="timeline-icon">
                {isCompleted || isDelivered ? '✓' : index + 1}
              </div>
              <div className="timeline-label">{step.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
