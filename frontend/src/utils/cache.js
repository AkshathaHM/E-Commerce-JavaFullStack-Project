const store = {};

export function setCache(key, value, ttlMs = 30000) {
  const expires = Date.now() + ttlMs;
  store[key] = { value, expires };
}

export function getCache(key) {
  const entry = store[key];
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    delete store[key];
    return null;
  }
  return entry.value;
}

export function clearCache(key) {
  if (key) delete store[key];
  else Object.keys(store).forEach(k => delete store[k]);
}

export default { getCache, setCache, clearCache };
