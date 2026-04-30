'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const DEFAULT_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=85',
    label: 'Luxury Rooms & Suites',
  },
  {
    img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&q=85',
    label: 'World-Class Suites',
  },
  {
    img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=85',
    label: 'Rooftop Pool & Spa',
  },
  {
    img: 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=1600&q=85',
    label: 'Presidential Experience',
  },
  {
    img: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1600&q=85',
    label: 'Fine Dining & Bar',
  },
  {
    img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=85',
    label: 'Elegant Interiors',
  },
];

export default function HeroSlideshow({ hotel, roomTypes = [] }) {
  const slides = DEFAULT_SLIDES;
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const go = useCallback((indexOrFn) => {
    setFading(true);
    setTimeout(() => {
      setCurrent((c) => (typeof indexOrFn === 'function' ? indexOrFn(c) : indexOrFn));
      setFading(false);
    }, 300);
  }, []);

  // Auto-advance every 5s
  useEffect(() => {
    const t = setInterval(() => go((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length, go]);

  const prev = () => go((c) => (c - 1 + slides.length) % slides.length);
  const next = () => go((c) => (c + 1) % slides.length);

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background images — all pre-loaded, faded in/out */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current && !fading ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          <img
            src={slide.img}
            alt={slide.label}
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 sm:px-8 w-full">
        <div className="max-w-2xl text-white">
          {hotel?.starRating && (
            <div className="flex gap-1 mb-4">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <span key={i} className="text-yellow-400 text-xl">★</span>
              ))}
            </div>
          )}

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-4">
            {hotel?.name || 'Grand Horizon Hotel'}
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-3 font-light">
            {hotel?.city ? `${hotel.city}, ${hotel.state}` : 'Bangalore, Karnataka'}
          </p>

          {/* Slide label badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/20 text-white/90 text-sm px-4 py-1.5 rounded-full mb-4 transition-all duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
            {slides[current].label}
          </div>

          <p className="text-base text-white/70 mb-8 leading-relaxed max-w-lg">
            {hotel?.description?.slice(0, 160) + '…' || 'Experience luxury hospitality at its finest.'}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/hotel/book" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl transition text-lg shadow-lg">
              Explore &amp; Book
            </Link>
            <Link href="/auth/login" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition text-lg">
              Sign In
            </Link>
          </div>

          {hotel && (
            <div className="flex gap-8 mt-10 pt-8 border-t border-white/20">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{hotel.starRating}★</p>
                <p className="text-white/60 text-sm mt-0.5">Star Hotel</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{roomTypes.length}</p>
                <p className="text-white/60 text-sm mt-0.5">Room Types</p>
              </div>
              {hotel.startingPrice && (
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">₹{hotel.startingPrice.toLocaleString()}</p>
                  <p className="text-white/60 text-sm mt-0.5">Starting/Night</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl backdrop-blur-sm transition-all hover:scale-110"
      >‹</button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl backdrop-blur-sm transition-all hover:scale-110"
      >›</button>

      {/* Dot / thumbnail strip */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center">
        {slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            title={slide.label}
            className={`overflow-hidden rounded-lg border-2 transition-all duration-300 ${
              i === current
                ? 'w-16 h-10 border-white scale-110 shadow-xl'
                : 'w-10 h-7 border-transparent opacity-60 hover:opacity-90 hover:scale-105'
            }`}
          >
            <img src={slide.img} alt={slide.label} className="w-full h-full object-cover" draggable={false} />
          </button>
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute top-6 right-6 z-20 bg-black/40 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
        {current + 1} / {slides.length}
      </div>
    </section>
  );
}
