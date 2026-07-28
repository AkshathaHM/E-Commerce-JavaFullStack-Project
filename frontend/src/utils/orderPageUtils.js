export const coerceOrderArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (value == null) {
    return [];
  }

  if (typeof value === 'object') {
    if (Array.isArray(value.orders)) {
      return value.orders;
    }

    if (Array.isArray(value.products)) {
      return value.products;
    }

    if (Array.isArray(value.data)) {
      return value.data;
    }

    return [value];
  }

  return [];
};
