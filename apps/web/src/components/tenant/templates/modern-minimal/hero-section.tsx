'use client';

/**
 * Modern Minimal Template — Hero Section
 * Clean aesthetic with bold typography, asymmetric layout, floating search card.
 */

import Image from 'next/image';
import { Star, MapPin, Shield, Award } from 'lucide-react';
import { sanitizeColor, sanitizeImageUrl, sanitizeText } from '@/lib/security/sanitize';
import type { HeroSectionProps } from '../types';
import { SearchWidget } from '../shared/search-widget';

export function ModernMinimalHero({
  hotel, theme,
  checkIn, checkOut, guests,
  onCheckInChange, onCheckOutChange, onGuestsChange,
}: HeroSectionProps) {
  const primary = sanitizeColor(theme.primaryColor, '#2563eb');
  const secondary = sanitizeColor(theme.secondaryColor, '#1e40af');
  const heroImg = sanitizeImageUrl(hotel.heroImageUrl);

  return (
    <>
      <section className="relative min-h-[85vh] flex items-center">
        {/* Split layout: left text, right image */}
        <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2">
          {/* Left — gradient background */}
          <div
            className="hidden lg:block"
            style={{ background: `linear-gradient(160deg, ${primary}08, ${primary}15)` }}
          />
          {/* Right — hero image */}
          <div className="relative">
            {heroImg ? (
              <Image
                src={heroImg}
                alt={sanitizeText(hotel.name)}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent lg:block hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:hidden" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="max-w-xl">
            {hotel.isVerified && (
              <div
                className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full mb-6 border"
                style={{
                  color: primary,
                  borderColor: `${primary}30`,
                  backgroundColor: `${primary}08`,
                }}
              >
                <Shield className="w-3.5 h-3.5" />
                Verified
              </div>
            )}

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-gray-900 lg:text-gray-900 text-white mb-4"
              style={{ fontFamily: theme.fontFamily }}
            >
              {sanitizeText(hotel.name)}
            </h1>

            {hotel.tagline && (
              <p className="text-xl text-gray-500 lg:text-gray-500 text-white/80 font-light mb-6 max-w-md">
                {sanitizeText(hotel.tagline)}
              </p>
            )}

            <div className="flex items-center gap-5 mb-8 text-sm">
              <div className="flex items-center gap-1">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              {hotel.averageRating && (
                <span className="flex items-center gap-1.5 text-gray-600 lg:text-gray-600 text-white/80">
                  <Award className="w-4 h-4" />
                  {hotel.averageRating.toFixed(1)}
                  <span className="text-gray-400">({hotel.reviewCount})</span>
                </span>
              )}
              <span className="flex items-center gap-1.5 text-gray-600 lg:text-gray-600 text-white/80">
                <MapPin className="w-4 h-4" />
                {sanitizeText(hotel.city)}
              </span>
            </div>

            {hotel.startingPrice && (
              <div className="flex items-baseline gap-1 text-gray-900 lg:text-gray-900 text-white">
                <span className="text-sm font-light text-gray-400 lg:text-gray-400 text-white/60">from</span>
                <span className="text-4xl font-extralight tracking-tight">
                  ₹{hotel.startingPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-light text-gray-400 lg:text-gray-400 text-white/60">/ night</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Floating search card */}
      <section className="relative z-20 -mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <SearchWidget
            theme={theme}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            onCheckInChange={onCheckInChange}
            onCheckOutChange={onCheckOutChange}
            onGuestsChange={onGuestsChange}
            variant="minimal"
          />
        </div>
      </section>
    </>
  );
}
