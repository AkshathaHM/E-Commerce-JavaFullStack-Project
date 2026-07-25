import { getCache, setCache, clearCache } from './cache';

export async function cachedFetch(key, url, options = {}, ttl = 30000) {
  const cached = getCache(key);
  if (cached) {
    fetch(url, options).then(async (res) => {
      if (!res.ok) return;
      try {
        const fresh = await res.json();
        setCache(key, fresh, ttl);
      } catch (e) {}
    }).catch(() => {});
    return cached;
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }

  const data = await res.json().catch(() => null);
  setCache(key, data, ttl);
  return data;
}

export function invalidateCache(key) {
  clearCache(key);
}

export default { cachedFetch, invalidateCache };
