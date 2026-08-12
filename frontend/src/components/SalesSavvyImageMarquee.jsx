import React, { useEffect, useMemo, useState } from 'react';
import { cachedFetch } from '../utils/apiClient';
import { getCache, setCache } from '../utils/cache';
import { normalizeProductList } from '../utils/products';
import '../assets/styles.css';

function firstImageForProduct(p) {
  if (!p) return null;
  if (Array.isArray(p.images) && p.images.length) {
    const found = p.images.find(Boolean);
    if (found) return found;
  }
  return p.imageUrl || p.image || p.image_url || p.img || null;
}

export default function SalesSavvyImageMarquee({ duration = '38s' }) {
  const cached = getCache('products_all') || [];
  const [products, setProducts] = useState(cached);

  useEffect(() => {
    let mounted = true;
    if (cached && cached.length) return undefined;

    (async () => {
      try {
        const url = `${import.meta.env.VITE_API_URL}/api/products`;
        const data = await cachedFetch('products_all', url, { credentials: 'include', headers: { 'Content-Type': 'application/json' } }, 60000);
        const list = normalizeProductList(data || []);
        if (!mounted) return;
        setProducts(list || []);
        try { setCache('products_all', list || [], 60000); } catch (e) {}
      } catch (e) {
        // swallow - marquee is decorative
        console.warn('Marquee product fetch failed', e);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const images = useMemo(() => {
    const imgs = (products || []).map(firstImageForProduct).filter(Boolean);
    // ensure minimum sequence length so marquee feels full
    if (imgs.length === 0) return [];

    let filled = imgs.slice();
    while (filled.length < 8) filled = filled.concat(imgs);

    // duplicate for seamless scroll
    return [...filled, ...filled];
  }, [products]);

  if (!images || images.length === 0) return null;

  return (
    <section className="sales-savvy-image-marquee" aria-hidden="true">
      <div className="sales-savvy-image-marquee__ambient" />
      <div className="sales-savvy-image-marquee__track" style={{ animationDuration: duration }}>
        {images.map((src, idx) => (
          <div className="sales-savvy-image-marquee__item" key={`${src}-${idx}`}>
            <img loading="lazy" src={src} alt="" className="sales-savvy-image-marquee__image" />
          </div>
        ))}
      </div>
    </section>
  );
}
