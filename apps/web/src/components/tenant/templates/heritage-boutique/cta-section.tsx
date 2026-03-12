'use client';

/**
 * Heritage Boutique Template — CTA Section
 * Warm invitation with heritage aesthetics and ornamental details.
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { sanitizeColor, sanitizeText } from '@/lib/security/sanitize';
import type { CTASectionProps } from '../types';

export function HeritageBoutiqueCTA({ hotel, theme }: CTASectionProps) {
  const primary = sanitizeColor(theme.primaryColor, '#92400e');
  const secondary = sanitizeColor(theme.secondaryColor, '#78350f');
  const accent = sanitizeColor(theme.accentColor, '#b45309');

  return (
    <section
      className="py-24 text-center relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
    >
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="relative max-w-3xl mx-auto px-4">
        {/* Ornamental divider */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-16 h-px bg-white/30" />
          <div className="w-2 h-2 rotate-45 border border-white/40" />
          <div className="w-16 h-px bg-white/30" />
        </div>

        <h2
          className="text-3xl md:text-4xl text-white mb-4"
          style={{ fontFamily: "'Playfair Display', 'Lora', serif", fontWeight: 300 }}
        >
          Experience the Legacy of {sanitizeText(hotel.name)}
        </h2>
        <p
          className="text-white/70 mb-10 text-lg"
          style={{ fontFamily: "'Lora', serif" }}
        >
          Reserve your stay and become part of our story — best rates guaranteed when booked directly.
        </p>
        <Link href="/hotel/rooms">
          <Button
            size="lg"
            className="px-10 text-white border-2 bg-transparent hover:bg-white/10"
            style={{ borderColor: accent, color: '#ffffff' }}
          >
            Reserve Your Stay
          </Button>
        </Link>

        {/* Bottom ornamental divider */}
        <div className="flex items-center justify-center gap-3 mt-10">
          <div className="w-16 h-px bg-white/30" />
          <div className="w-2 h-2 rotate-45 border border-white/40" />
          <div className="w-16 h-px bg-white/30" />
        </div>
      </div>
    </section>
  );
}
