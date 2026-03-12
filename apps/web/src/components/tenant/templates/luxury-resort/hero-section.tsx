'use client';

/**
 * Luxury Resort Template — Hero Section
 * Full-viewport cinematic image, elegant serif typography, parallax feel.
 */

import Image from 'next/image';
import { Star, MapPin, Shield, Award } from 'lucide-react';
import { sanitizeColor, sanitizeImageUrl, sanitizeText } from '@/lib/security/sanitize';
import { SearchWidget } from '../shared/search-widget';
import type { HeroSectionProps } from '../types';

export function LuxuryResortHero({
  hotel, theme,
  checkIn, checkOut, guests,
  onCheckInChange, onCheckOutChange, onGuestsChange,
}: HeroSectionProps) {
  const primary = sanitizeColor(theme.primaryColor, '#2563eb');
  const secondary = sanitizeColor(theme.secondaryColor, '#1e40af');
  const accent = sanitizeColor(theme.accentColor, '#d4a574');
  const heroImg = sanitizeImageUrl(hotel.heroImageUrl);

  return (
    <>
      <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center justify-center text-center">
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
        <div className="absolute inset-0 bg-black/45" />

        {/* Decorative top border */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: accent }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4">
          {hotel.isVerified && (
            <div className="inline-flex items-center gap-1.5 text-xs tracking-[0.2em] uppercase text-white/70 mb-6">
              <Shield className="w-3.5 h-3.5" />
              Verified Property
            </div>
          )}

          {/* Decorative line */}
          <div className="w-12 h-px mx-auto mb-6" style={{ backgroundColor: accent }} />

          <h1
            className="text-4xl md:text-6xl lg:text-7xl text-white mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300 }}
          >
            {sanitizeText(hotel.name)}
          </h1>

          {hotel.tagline && (
            <p
              className="text-lg md:text-xl text-white/70 mb-6 tracking-wide"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
            >
              {sanitizeText(hotel.tagline)}
            </p>
          )}

          <div className="flex items-center justify-center gap-6 mb-8 text-sm text-white/60">
            <div className="flex items-center gap-1">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            {hotel.averageRating && (
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                {hotel.averageRating.toFixed(1)} ({hotel.reviewCount} reviews)
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {sanitizeText(hotel.city)}, {sanitizeText(hotel.state)}
            </span>
          </div>

          {hotel.startingPrice && (
            <div className="text-white">
              <span className="text-sm tracking-wider uppercase text-white/50">From</span>
              <span
                className="text-4xl ml-3"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300 }}
              >
                ₹{hotel.startingPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-white/50 ml-1">per night</span>
            </div>
          )}
        </div>

        {/* Decorative bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Search widget */}
      <section className="relative z-20 -mt-16">
        <div className="max-w-4xl mx-auto px-4">
          <SearchWidget
            theme={theme}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            onCheckInChange={onCheckInChange}
            onCheckOutChange={onCheckOutChange}
            onGuestsChange={onGuestsChange}
            variant="luxury"
          />
        </div>
      </section>
    </>
  );
}
