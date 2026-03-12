'use client';

/**
 * Heritage Boutique Template — Hero Section
 * Warm editorial feel — textured background, ornamental details, story-driven.
 */

import Image from 'next/image';
import { Star, MapPin, Shield, Award } from 'lucide-react';
import { sanitizeColor, sanitizeImageUrl, sanitizeText } from '@/lib/security/sanitize';
import { SearchWidget } from '../shared/search-widget';
import type { HeroSectionProps } from '../types';

export function HeritageBoutiqueHero({
  hotel, theme,
  checkIn, checkOut, guests,
  onCheckInChange, onCheckOutChange, onGuestsChange,
}: HeroSectionProps) {
  const primary = sanitizeColor(theme.primaryColor, '#92400e');
  const accent = sanitizeColor(theme.accentColor, '#b45309');
  const heroImg = sanitizeImageUrl(hotel.heroImageUrl);

  return (
    <>
      <section className="relative min-h-[90vh] flex items-center bg-stone-50">
        {/* Background image with warm overlay */}
        <div className="absolute inset-0">
          {heroImg ? (
            <Image
              src={heroImg}
              alt={sanitizeText(hotel.name)}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-stone-800 to-stone-900" />
          )}
          {/* Warm sepia-tinted overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/50 via-stone-900/40 to-stone-900/70" />
          <div className="absolute inset-0 mix-blend-multiply bg-amber-900/20" />
        </div>

        {/* Ornamental border */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-600/60 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-600/60 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center py-24">
          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-px bg-amber-400/40" />
            <div className="w-2 h-2 rotate-45 border border-amber-400/50" />
            <div className="w-16 h-px bg-amber-400/40" />
          </div>

          {hotel.isVerified && (
            <div className="inline-flex items-center gap-1.5 text-xs tracking-[0.25em] uppercase text-amber-300/70 mb-4">
              <Shield className="w-3.5 h-3.5" />
              Heritage Property
            </div>
          )}

          <h1
            className="text-4xl md:text-5xl lg:text-6xl text-white mb-4 leading-snug"
            style={{ fontFamily: "'Playfair Display', 'Lora', serif", fontWeight: 400 }}
          >
            {sanitizeText(hotel.name)}
          </h1>

          {hotel.tagline && (
            <p
              className="text-lg md:text-xl text-amber-200/70 mb-6 max-w-2xl mx-auto"
              style={{ fontFamily: "'Lora', serif", fontStyle: 'italic' }}
            >
              &ldquo;{sanitizeText(hotel.tagline)}&rdquo;
            </p>
          )}

          {/* Star rating & info */}
          <div className="flex items-center justify-center flex-wrap gap-4 mb-8 text-sm text-white/60">
            <div className="flex items-center gap-1">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            {hotel.averageRating && (
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-400/70" />
                {hotel.averageRating.toFixed(1)} &middot; {hotel.reviewCount} reviews
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {sanitizeText(hotel.city)}, {sanitizeText(hotel.state)}
            </span>
          </div>

          {hotel.startingPrice && (
            <div className="text-white mb-8">
              <span className="text-sm tracking-widest uppercase text-amber-300/50">Rates from</span>
              <div
                className="text-4xl mt-1"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300 }}
              >
                ₹{hotel.startingPrice.toLocaleString('en-IN')}
                <span className="text-base text-white/40 ml-1">per night</span>
              </div>
            </div>
          )}

          {/* Bottom ornamental divider */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-px bg-amber-400/40" />
            <div className="w-2 h-2 rotate-45 border border-amber-400/50" />
            <div className="w-16 h-px bg-amber-400/40" />
          </div>
        </div>

        {/* Gradient bottom fade to warm beige */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-stone-50 to-transparent" />
      </section>

      {/* Search widget with warm styling */}
      <section className="relative z-20 -mt-8">
        <div className="max-w-4xl mx-auto px-4">
          <SearchWidget
            theme={theme}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            onCheckInChange={onCheckInChange}
            onCheckOutChange={onCheckOutChange}
            onGuestsChange={onGuestsChange}
            variant="default"
          />
        </div>
      </section>
    </>
  );
}
