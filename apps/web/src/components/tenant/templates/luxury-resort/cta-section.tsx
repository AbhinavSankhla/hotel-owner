'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { sanitizeColor, sanitizeText } from '@/lib/security/sanitize';
import type { CTASectionProps } from '../types';

export function LuxuryResortCTA({ hotel, theme }: CTASectionProps) {
  const accent = sanitizeColor(theme.accentColor, '#d4a574');

  return (
    <section className="py-24 bg-gray-950 text-white text-center">
      <div className="max-w-3xl mx-auto px-4">
        <div className="w-12 h-px mx-auto mb-6" style={{ backgroundColor: accent }} />
        <h2
          className="text-3xl md:text-4xl text-white mb-4"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300 }}
        >
          Begin Your Journey at {sanitizeText(hotel.name)}
        </h2>
        <p className="text-gray-400 mb-10 font-light">
          Reserve your experience today — best rates guaranteed when booked directly.
        </p>
        <Link href="/hotel/rooms">
          <Button
            size="lg"
            className="text-gray-950 px-10"
            style={{ backgroundColor: accent }}
          >
            Reserve Now
          </Button>
        </Link>
      </div>
    </section>
  );
}
