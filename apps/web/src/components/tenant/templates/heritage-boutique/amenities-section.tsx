'use client';

/**
 * Heritage Boutique Template — Amenities Section
 * Warm stone-toned grid with ornamental headings.
 */

import { sanitizeColor } from '@/lib/security/sanitize';
import { getAmenityIcon, getAmenityLabel } from '../shared/amenities';
import type { AmenitiesSectionProps } from '../types';

export function HeritageBoutiqueAmenities({ hotel, theme }: AmenitiesSectionProps) {
  const accent = sanitizeColor(theme.accentColor, '#b45309');

  if (!hotel.amenities?.length) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-px" style={{ backgroundColor: accent }} />
            <div className="w-2 h-2 rotate-45 border" style={{ borderColor: accent }} />
            <div className="w-12 h-px" style={{ backgroundColor: accent }} />
          </div>
          <h2
            className="text-3xl text-stone-800 mb-3"
            style={{ fontFamily: "'Playfair Display', 'Lora', serif", fontWeight: 400 }}
          >
            Amenities & Comforts
          </h2>
          <p className="text-stone-500" style={{ fontFamily: "'Lora', serif" }}>
            Thoughtfully curated for your relaxation and delight
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {hotel.amenities.map((amenity) => (
            <div
              key={amenity}
              className="text-center p-5 border border-stone-100 bg-stone-50/50 hover:bg-white hover:border-stone-200 hover:shadow-sm transition-all duration-300 group"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-3 border transition-colors"
                style={{ borderColor: `${accent}40`, color: accent }}
              >
                {getAmenityIcon(amenity)}
              </div>
              <span
                className="text-sm text-stone-600"
                style={{ fontFamily: "'Lora', serif" }}
              >
                {getAmenityLabel(amenity)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
