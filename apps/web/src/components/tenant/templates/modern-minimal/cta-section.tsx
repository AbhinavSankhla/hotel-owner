'use client';

/**
 * Modern Minimal Template — CTA Section
 * Subtle gradient with clean typography.
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { sanitizeColor, sanitizeText } from '@/lib/security/sanitize';
import type { CTASectionProps } from '../types';

export function ModernMinimalCTA({ hotel, theme }: CTASectionProps) {
  const primary = sanitizeColor(theme.primaryColor, '#2563eb');
  const secondary = sanitizeColor(theme.secondaryColor, '#1e40af');

  return (
    <section
      className="py-20 text-center"
      style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
    >
      <div className="max-w-2xl mx-auto px-4">
        <h2
          className="text-3xl md:text-4xl font-light text-white mb-4 tracking-tight"
          style={{ fontFamily: theme.fontFamily }}
        >
          Experience {sanitizeText(hotel.name)}
        </h2>
        <p className="text-white/70 mb-8 font-light">
          Book your stay today and enjoy the best rates when you book direct.
        </p>
        <Link href="/hotel/rooms">
          <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-50 rounded-full px-10">
            Browse Rooms
          </Button>
        </Link>
      </div>
    </section>
  );
}
