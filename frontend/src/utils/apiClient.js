import { getCache, setCache, clearCache } from './cache';

const inflight = new Map();

export async function cachedFetch(key, url, options = {}, ttl = 30000) {
  const cached = getCache(key);
  if (cached) {
    // background refresh but dedupe inflight background calls
    if (!inflight.has(key)) {
      const p = fetch(url, options).then(async (res) => {
        if (!res.ok) return null;
        try {
          const fresh = await res.json();
          setCache(key, fresh, ttl);
          return fresh;
        } catch (e) { return null; }
      }).catch(() => null).finally(() => inflight.delete(key));
      inflight.set(key, p);
    }
    return cached;
  }

  // if another call for the same key is inflight, reuse it
  if (inflight.has(key)) {
    try {
      const data = await inflight.get(key);
      if (data) return data;
    } catch (e) {}
  }

  const promise = (async () => {
    const res = await fetch(url, options);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Request failed: ${res.status}`);
    }

    const data = await res.json().catch(() => null);
    setCache(key, data, ttl);
    return data;
  })();

  inflight.set(key, promise);
  try {
    const result = await promise;
    return result;
  } finally {
    inflight.delete(key);
  }
}

export function invalidateCache(key) {
  clearCache(key);
}

export default { cachedFetch, invalidateCache };
