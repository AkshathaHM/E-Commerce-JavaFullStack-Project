import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './assets/styles.css';
import { LandingHeader } from './LandingHeader';
import { Footer } from './Footer';

const HERO_IMAGES = [
  '/landing-images/shirts.jpg',
  '/landing-images/pants.jpg',
  '/landing-images/phone.jpg',
  '/landing-images/phones.avif',
  '/landing-images/tvs.webp',
  '/landing-images/laps.jpg',
  '/landing-images/Gemini_Generated_Image_9xwq8q9xwq8q9xwq.png',
];

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentImageIndex((index) => (index + 1) % HERO_IMAGES.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="landing-page">
      <LandingHeader />

      <main className="landing-hero">
        {HERO_IMAGES.map((src, index) => (
          <div
            key={src}
            className={`landing-hero__bg${index === currentImageIndex ? ' landing-hero__bg--active' : ''}`}
            style={{ backgroundImage: `url('${src}')` }}
            aria-hidden="true"
          />
        ))}

        <div className="landing-hero__overlay" />
        <div className="landing-hero__content">
          <p className="landing-hero__eyebrow">About SalesSavvy</p>
          <h1 className="landing-hero__title">Discover curated collections of boy&apos;s shirts, pants, and mobile accessories.</h1>
          <p className="landing-hero__text">
            Experience premium, savvy shopping with the latest styles and must-have tech essentials.
          </p>
        </div>
        <div className="landing-hero__pager" aria-label="Landing slideshow navigation">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`landing-hero__pager-dot${index === currentImageIndex ? ' landing-hero__pager-dot--active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`Show slide ${index + 1}`}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
