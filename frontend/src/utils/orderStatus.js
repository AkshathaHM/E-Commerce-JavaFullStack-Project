export const ORDER_STATUS_SEQUENCE = [
  { key: 'placed', label: 'Order Placed', detail: 'Your order has been received and is being prepared.' },
  { key: 'confirmed', label: 'Confirmed', detail: 'The merchant confirmed your order and prepared the shipment.' },
  { key: 'packed', label: 'Packed', detail: 'Items were packed securely and are ready for dispatch.' },
  { key: 'shipped', label: 'Shipped', detail: 'The courier collected your package for delivery.' },
  { key: 'out_for_delivery', label: 'Out For Delivery', detail: 'The courier is on the way with your delivery.' },
  { key: 'delivered', label: 'Delivered', detail: 'The package reached you successfully.' },
  { key: 'cancelled', label: 'Cancelled', detail: 'The order was cancelled before it was dispatched.' },
];

const TIME_THRESHOLDS_MINUTES = {
  confirmed: 60,      // 1 hour
  packed: 120,        // 2 hours
  shipped: 180,       // 3 hours
  out_for_delivery: 240,  // 4 hours
  delivered: 300,     // 5 hours
};

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

/**
 * Safely parse createdAt timestamp from various formats that the backend might send
 * Handles: ISO 8601 string, milliseconds since epoch, array format
 */
function parseCreatedAtSafely(createdAt) {
  if (!createdAt) {
    console.warn('[Status Parse] createdAt is missing/null/undefined');
    return null;
  }

  // If it's already a Date, use it directly
  if (createdAt instanceof Date) {
    return createdAt;
  }

  // If it's a string, try to parse as ISO 8601
  if (typeof createdAt === 'string') {
    try {
      const parsed = new Date(createdAt);
      if (!Number.isNaN(parsed.getTime())) {
        console.log('[Status Parse] Successfully parsed ISO string:', { input: createdAt, parsed: parsed.toISOString() });
        return parsed;
      }
    } catch (e) {
      console.warn('[Status Parse] Failed to parse ISO string:', createdAt, e.message);
    }
  }

  // If it's a number, could be milliseconds since epoch
  if (typeof createdAt === 'number') {
    try {
      const parsed = new Date(createdAt);
      if (!Number.isNaN(parsed.getTime())) {
        console.log('[Status Parse] Successfully parsed epoch number:', { input: createdAt, parsed: parsed.toISOString() });
        return parsed;
      }
    } catch (e) {
      console.warn('[Status Parse] Failed to parse epoch number:', createdAt, e.message);
    }
  }

  // If it's an array (Spring Boot LocalDateTime serialization), construct ISO string
  if (Array.isArray(createdAt) && createdAt.length >= 3) {
    try {
      const [year, month, day, hour = 0, minute = 0, second = 0] = createdAt;
      const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
      const parsed = new Date(isoString);
      if (!Number.isNaN(parsed.getTime())) {
        console.log('[Status Parse] Successfully parsed array format:', { input: createdAt, isoString, parsed: parsed.toISOString() });
        return parsed;
      }
    } catch (e) {
      console.warn('[Status Parse] Failed to parse array format:', createdAt, e.message);
    }
  }

  // If we get here, the format is unsupported
  console.error('[Status Parse] Unsupported createdAt format - cannot parse:', { value: createdAt, type: typeof createdAt });
  return null;
}

export function getDerivedOrderStatus(createdAt, rawStatus = '') {
  // If explicitly cancelled, return cancelled regardless of time
  const normalized = normalizeStatusText(rawStatus);
  if (normalized === 'cancelled') {
    return 'cancelled';
  }

  // Parse createdAt with defensive handling for various formats
  const createdDate = parseCreatedAtSafely(createdAt);
  if (!createdDate) {
    console.warn('[Status Calc] Could not parse createdAt; defaulting to placed status');
    return 'placed';
  }

  const createdTime = createdDate.getTime();
  const nowTime = Date.now();
  const elapsedMs = nowTime - createdTime;
  const elapsedMinutes = Math.floor(elapsedMs / 60000);

  // Sanity check: if elapsed time is negative (order created in future), something is wrong
  if (elapsedMinutes < 0) {
    console.warn('[Status Calc] Order created in the future (clock skew?); elapsed:', elapsedMinutes, 'minutes; defaulting to placed');
    return 'placed';
  }

  // Sanity check: if elapsed time is unreasonably large (>10 years), creation date parsing failed
  const MAX_REASONABLE_MINUTES = 10 * 365 * 24 * 60; // ~10 years
  if (elapsedMinutes > MAX_REASONABLE_MINUTES) {
    console.warn('[Status Calc] Unreasonably large elapsed time:', elapsedMinutes, 'minutes (>10 years); creation date likely parsed incorrectly; defaulting to placed');
    return 'placed';
  }

  console.log('[Status Calc] Order created at:', createdDate.toISOString(), 'Elapsed:', elapsedMinutes, 'minutes → Status:', determineStatusFromElapsed(elapsedMinutes));

  return determineStatusFromElapsed(elapsedMinutes);
}

/**
 * Determine order status based on elapsed minutes
 */
function determineStatusFromElapsed(elapsedMinutes) {
  if (elapsedMinutes >= TIME_THRESHOLDS_MINUTES.delivered) {
    return 'delivered';
  }
  if (elapsedMinutes >= TIME_THRESHOLDS_MINUTES.out_for_delivery) {
    return 'out_for_delivery';
  }
  if (elapsedMinutes >= TIME_THRESHOLDS_MINUTES.shipped) {
    return 'shipped';
  }
  if (elapsedMinutes >= TIME_THRESHOLDS_MINUTES.packed) {
    return 'packed';
  }
  if (elapsedMinutes >= TIME_THRESHOLDS_MINUTES.confirmed) {
    return 'confirmed';
  }
  return 'placed';
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

