export function getCartItemId(item) {
  return item?.product_id ?? item?.productId ?? item?.id ?? null;
}

export function getCartItemQuantity(item) {
  const quantity = Number(item?.quantity ?? item?.qty ?? 0);
  return Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
}

export function getCartItemPrice(item) {
  const price = Number(item?.price_per_unit ?? item?.price ?? item?.unit_price ?? item?.total_price ?? 0);
  return Number.isFinite(price) ? price : 0;
}

export function getCartItemStockLimit(item) {
  const stockValue = item?.stock ?? item?.availableStock ?? item?.available_stock ?? item?.maxQuantity ?? item?.max_quantity ?? item?.quantityAvailable ?? item?.quantity_available ?? item?.inventory ?? item?.product_stock;
  const numericStock = Number(stockValue);
  return Number.isFinite(numericStock) && numericStock >= 0 ? numericStock : null;
}

export function canIncreaseCartItem(item) {
  const stockLimit = getCartItemStockLimit(item);
  const currentQty = getCartItemQuantity(item);
  return stockLimit === null || currentQty < stockLimit;
}

export function mergeCartItemById(items, incomingItem) {
  const normalizedItems = Array.isArray(items) ? items : [];
  const id = getCartItemId(incomingItem);
  if (!id) return normalizedItems;

  const existingIndex = normalizedItems.findIndex((item) => String(getCartItemId(item)) === String(id));
  if (existingIndex === -1) {
    return [...normalizedItems, { ...incomingItem, quantity: Math.max(1, getCartItemQuantity(incomingItem)) }];
  }

  const existingItem = normalizedItems[existingIndex];
  const nextQuantity = getCartItemQuantity(existingItem) + getCartItemQuantity(incomingItem);
  const nextTotalPrice = Number(getCartItemPrice(existingItem)) * nextQuantity;
  const mergedItem = {
    ...existingItem,
    ...incomingItem,
    quantity: nextQuantity,
    total_price: Number.isFinite(nextTotalPrice) ? nextTotalPrice.toFixed(2) : '0.00',
  };

  return normalizedItems.map((item, index) => (index === existingIndex ? mergedItem : item));
}
