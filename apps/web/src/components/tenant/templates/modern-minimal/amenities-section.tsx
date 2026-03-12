'use client';

/**
 * Modern Minimal Template — Amenities Section
 * Horizontal scroll chips, clean and lightweight.
 */

import { sanitizeColor, sanitizeText } from '@/lib/security/sanitize';
import { getAmenityIcon, getAmenityLabel } from '../shared/amenities';
import type { AmenitiesSectionProps } from '../types';

export function ModernMinimalAmenities({ hotel, theme }: AmenitiesSectionProps) {
  const primary = sanitizeColor(theme.primaryColor, '#2563eb');

  if (!hotel.amenities?.length) return null;

  return (
    <section className="py-16 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold tracking-widest uppercase mb-8" style={{ color: primary }}>
          Amenities
        </p>
        <div className="flex flex-wrap gap-3">
          {hotel.amenities.map((amenity) => (
            <div
              key={amenity}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-gray-200 hover:border-gray-300 transition-colors text-sm"
            >
              <span style={{ color: primary }}>
                {getAmenityIcon(amenity)}
              </span>
              <span className="text-gray-700 font-light">
                {getAmenityLabel(sanitizeText(amenity) || amenity)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
