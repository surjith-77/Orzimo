import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Calendar, ShieldCheck } from 'lucide-react';
import { PROMO_BANNERS } from '../../data/products';

export default function HeroBanners({ onSelectCategory, onOpenQuickBooking }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % PROMO_BANNERS.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + PROMO_BANNERS.length) % PROMO_BANNERS.length);
  };

  const banner = PROMO_BANNERS[currentSlide];

  return (
    <section 
      className="hero-banner-section" 
      aria-label="Promotional Showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        <div 
          className="banner-carousel-container"
          style={{ background: banner.bgGradient }}
        >
          <div className="banner-slide">
            <div className="banner-content">
              <span className="banner-badge">
                <Sparkles size={14} color="var(--color-yellow)" />
                {banner.badge}
              </span>
              <p style={{ fontSize: '0.85rem', color: banner.accentColor, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>
                {banner.tagline}
              </p>
              <h1 className="banner-title">{banner.title}</h1>
              <p className="banner-subtitle">{banner.subtitle}</p>

              <div className="banner-actions">
                <button 
                  className="btn btn-yellow btn-lg"
                  onClick={() => onSelectCategory(banner.ctaCategory)}
                >
                  <Calendar size={18} />
                  {banner.ctaText}
                  <ArrowRight size={18} />
                </button>
                <button 
                  className="btn btn-seller btn-lg"
                  onClick={() => onSelectCategory(banner.ctaCategory)}
                >
                  <ShieldCheck size={18} />
                  {banner.secondaryCta}
                </button>
              </div>
            </div>

            <div className="banner-media">
              <img 
                src={banner.image} 
                alt={banner.title}
                loading="eager"
              />
            </div>
          </div>

          {/* Carousel Arrows */}
          <button 
            className="carousel-nav-btn carousel-nav-prev"
            onClick={prevSlide}
            aria-label="Previous promotional banner"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            className="carousel-nav-btn carousel-nav-next"
            onClick={nextSlide}
            aria-label="Next promotional banner"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dot Indicators */}
          <div className="carousel-indicators">
            {PROMO_BANNERS.map((_, idx) => (
              <button
                type="button"
                key={idx}
                className={`indicator-dot ${currentSlide === idx ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
