'use client';

/**
 * Luxury Resort Template — Amenities Section
 * Elegant grid with centered icons, dark background.
 */

import { sanitizeColor } from '@/lib/security/sanitize';
import { getAmenityIcon, getAmenityLabel } from '../shared/amenities';
import type { AmenitiesSectionProps } from '../types';

export function LuxuryResortAmenities({ hotel, theme }: AmenitiesSectionProps) {
  const accent = sanitizeColor(theme.accentColor, '#d4a574');

  if (!hotel.amenities?.length) return null;

  return (
    <section className="py-20 bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="w-12 h-px mx-auto mb-4" style={{ backgroundColor: accent }} />
          <h2
            className="text-3xl text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Facilities & Services
          </h2>
          <p className="text-gray-400 font-light">Curated amenities for a refined experience</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {hotel.amenities.map((amenity) => (
            <div key={amenity} className="text-center group">
              <div className="w-12 h-12 rounded-full border border-gray-700 group-hover:border-gray-500 flex items-center justify-center mx-auto mb-3 transition-colors">
                <span style={{ color: accent }}>
                  {getAmenityIcon(amenity)}
                </span>
              </div>
              <span className="text-sm text-gray-400 font-light">
                {getAmenityLabel(amenity)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
