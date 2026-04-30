'use client';

import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

function resolveImg(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

/** Small inline slideshow used inside room cards */
export function RoomCardSlideshow({ images = [], alt = 'Room image', fallback }) {
  const resolved = images.map(resolveImg).filter(Boolean);
  const srcs = resolved.length > 0 ? resolved : fallback ? [fallback] : [];
  const [current, setCurrent] = useState(0);

  if (srcs.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-4xl">🛏️</div>
    );
  }

  const prev = (e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + srcs.length) % srcs.length); };
  const next = (e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % srcs.length); };

  return (
    <div className="relative w-full h-full group overflow-hidden bg-gray-100">
      <img
        key={current}
        src={srcs[current]}
        alt={`${alt} ${current + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      />
      {srcs.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none" aria-label="Previous">‹</button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none" aria-label="Next">›</button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {srcs.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/50'}`} aria-label={`Image ${i + 1}`} />
            ))}
          </div>
          <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">{current + 1}/{srcs.length}</span>
        </>
      )}
    </div>
  );
}

/** Full-page hero slideshow used on room detail page */
export default function RoomImageSlideshow({ images = [], name = '' }) {
  const resolved = images.map(resolveImg).filter(Boolean);
  const srcs = resolved.length > 0 ? resolved : ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80'];

  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const go = useCallback((indexOrFn) => {
    setFading(true);
    setTimeout(() => {
      setCurrent((c) => (typeof indexOrFn === 'function' ? indexOrFn(c) : indexOrFn));
      setFading(false);
    }, 200);
  }, []);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (srcs.length < 2) return;
    const t = setInterval(() => go((c) => (c + 1) % srcs.length), 5000);
    return () => clearInterval(t);
  }, [srcs.length, go]);

  const prev = () => go((c) => (c - 1 + srcs.length) % srcs.length);
  const next = () => go((c) => (c + 1) % srcs.length);

  return (
    <div className="relative w-full overflow-hidden bg-gray-900 select-none"
      style={{ height: 'min(60vh, 640px)', minHeight: '320px' }}>
      {/* Slide image */}
      <img
        src={srcs[current]}
        alt={`${name} — photo ${current + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
        style={{ opacity: fading ? 0 : 1 }}
        draggable={false}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* Prev / Next */}
      {srcs.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl leading-none backdrop-blur-sm transition-all hover:scale-110"
          >‹</button>
          <button
            onClick={next}
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl leading-none backdrop-blur-sm transition-all hover:scale-110"
          >›</button>
        </>
      )}

      {/* Dot indicators */}
      {srcs.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {srcs.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Photo ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'bg-white w-7 h-2.5' : 'bg-white/50 hover:bg-white/80 w-2.5 h-2.5'
              }`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip */}
      {srcs.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-xl">
          {srcs.map((src, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`w-16 h-11 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                i === current ? 'border-white scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-90'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}

      {/* Counter */}
      <div className="absolute top-4 right-4 z-10 bg-black/50 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
        {current + 1} / {srcs.length}
      </div>
    </div>
  );
}

