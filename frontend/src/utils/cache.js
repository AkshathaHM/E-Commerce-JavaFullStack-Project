const store = {};

export function setCache(key, value, ttlMs = 30000) {
  const expires = Date.now() + ttlMs;
  try {
    const copy = typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
    store[key] = { value: copy, expires, ttlMs, createdAt: Date.now() };
  } catch (e) {
    store[key] = { value, expires, ttlMs, createdAt: Date.now() };
  }
}

export function getCache(key) {
  const entry = store[key];
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    delete store[key];
    return null;
  }
  try {
    return typeof structuredClone === 'function' ? structuredClone(entry.value) : JSON.parse(JSON.stringify(entry.value));
  } catch (e) {
    return entry.value;
  }
}

export function getRawCacheEntry(key) {
  const entry = store[key];
  if (!entry || Date.now() > entry.expires) return null;
  return entry;
}

export function clearCache(key) {
  if (key) delete store[key];
  else Object.keys(store).forEach(k => delete store[k]);
}

export default { getCache, getRawCacheEntry, setCache, clearCache };
