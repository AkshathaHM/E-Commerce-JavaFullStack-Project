const store = {};

function _persistKey(key, entry) {
  try {
    const payload = { value: entry.value, expires: entry.expires, ttlMs: entry.ttlMs, createdAt: entry.createdAt };
    window.localStorage.setItem(`__cache__${key}`, JSON.stringify(payload));
  } catch (e) {
    // ignore persistence errors
  }
}

function _readPersisted(key) {
  try {
    const raw = window.localStorage.getItem(`__cache__${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || Number.isNaN(Number(parsed.expires))) return null;
    if (Date.now() > Number(parsed.expires)) {
      window.localStorage.removeItem(`__cache__${key}`);
      return null;
    }
    return { value: parsed.value, expires: Number(parsed.expires), ttlMs: Number(parsed.ttlMs), createdAt: Number(parsed.createdAt) };
  } catch (e) {
    return null;
  }
}

export function setCache(key, value, ttlMs = 30000) {
  const expires = Date.now() + ttlMs;
  try {
    const copy = typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
    store[key] = { value: copy, expires, ttlMs, createdAt: Date.now() };
    // persist non-sensitive application data to localStorage for instant reloads
    _persistKey(key, store[key]);
  } catch (e) {
    store[key] = { value, expires, ttlMs, createdAt: Date.now() };
    try { _persistKey(key, store[key]); } catch (er) {}
  }
}

export function getCache(key) {
  const entry = store[key] || _readPersisted(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    try { delete store[key]; } catch (e) {}
    try { window.localStorage.removeItem(`__cache__${key}`); } catch (e) {}
    return null;
  }
  try {
    return typeof structuredClone === 'function' ? structuredClone(entry.value) : JSON.parse(JSON.stringify(entry.value));
  } catch (e) {
    return entry.value;
  }
}

export function getRawCacheEntry(key) {
  const entry = store[key] || _readPersisted(key);
  if (!entry || Date.now() > entry.expires) return null;
  return entry;
}

export function clearCache(key) {
  if (key) {
    delete store[key];
    try { window.localStorage.removeItem(`__cache__${key}`); } catch (e) {}
  } else {
    Object.keys(store).forEach(k => delete store[k]);
    try {
      Object.keys(window.localStorage).forEach((k) => { if (k && k.startsWith('__cache__')) window.localStorage.removeItem(k); });
    } catch (e) {}
  }
}

export default { getCache, getRawCacheEntry, setCache, clearCache };
