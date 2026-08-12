import React, { useEffect, useMemo, useState } from 'react';
import { cachedFetch } from '../utils/apiClient';
import { getCache, setCache } from '../utils/cache';
import { normalizeProductList } from '../utils/products';
import './home-product-motion-rail.css';

const getImageUrl = (product) => {
  if (!product) return null;
  if (Array.isArray(product.images) && product.images.length) {
    const firstImage = product.images.find(Boolean);
    if (firstImage) return firstImage;
  }
  return product.imageUrl || product.image || product.image_url || product.img || null;
};

const repeatUntilLength = (items, minLength) => {
  if (!items.length) return [];
  let result = [...items];
  while (result.length < minLength) {
    result = result.concat(items);
  }
  return result;
};

export default function HomeProductMotionRail() {
  const cachedProducts = getCache('products_all') || [];
  const [products, setProducts] = useState(cachedProducts);

  useEffect(() => {
    let mounted = true;
    if (cachedProducts && cachedProducts.length) {
      return undefined;
    }

    (async () => {
      try {
        const url = `${import.meta.env.VITE_API_URL}/api/products`;
        const data = await cachedFetch('products_all', url, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }, 60000);
        const list = normalizeProductList(data || []);
        if (!mounted) return;
        setProducts(list);
        try { setCache('products_all', list, 60000); } catch (error) {
          console.warn('Unable to cache products_all', error);
        }
      } catch (error) {
        console.warn('HomeProductMotionRail fetch failed', error);
      }
    })();

    return () => { mounted = false; };
  }, [cachedProducts]);

  const displayedProducts = useMemo(() => {
    const validProducts = (products || [])
      .map((product) => ({ product, image: getImageUrl(product) }))
      .filter((entry) => entry.image);

    if (!validProducts.length) {
      return [];
    }

    const baseList = repeatUntilLength(validProducts, 8);
    return [...baseList, ...baseList];
  }, [products]);

  if (!displayedProducts.length) {
    return null;
  }

  return (
    <section className="home-product-motion-section" aria-hidden="true">
      <div className="home-product-motion-track">
        {displayedProducts.map(({ product, image }, index) => (
          <div className="home-product-motion-card" key={`${product.id || product.product_id || product.productId || index}-${index}`}>
            <img
              src={image}
              alt=""
              className="home-product-motion-image"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
