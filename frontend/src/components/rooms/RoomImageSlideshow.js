'use client';

import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

function resolveImg(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
}

export default function RoomImageSlideshow({ images = [], alt = 'Room image', fallback }) {
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
          {/* Prev / Next buttons */}
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none"
            aria-label="Previous image"
          >‹</button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none"
            aria-label="Next image"
          >›</button>

          {/* Dot indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {srcs.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/50'}`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            {current + 1}/{srcs.length}
          </span>
        </>
      )}
    </div>
  );
}
