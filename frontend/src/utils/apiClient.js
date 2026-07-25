import { getCache, setCache } from './cache';

export async function cachedFetch(key, url, options = {}, ttl = 30000) {
  try {
    const cached = getCache(key);
    if (cached) {
      // background refresh, don't await
      fetch(url, options).then(async (res) => {
        if (!res.ok) return;
        try { const fresh = await res.json(); setCache(key, fresh, ttl); } catch (e) {}
      }).catch(() => {});
      return cached;
    }

    const res = await fetch(url, options);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Request failed: ${res.status}`);
    }

    const data = await res.json().catch(() => null);
    try { setCache(key, data, ttl); } catch (e) {}
    return data;
  } catch (err) {
    throw err;
  }
}

export function invalidateCache(key) {
  try { const cache = require('./cache'); cache.clearCache(key); } catch (e) {}
}

export default { cachedFetch, invalidateCache };
