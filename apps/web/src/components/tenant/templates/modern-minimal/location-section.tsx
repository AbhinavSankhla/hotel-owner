'use client';

/**
 * Modern Minimal Template — Location Section
 * Clean two-column with map placeholder.
 */

import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sanitizeColor, sanitizeText } from '@/lib/security/sanitize';
import type { LocationSectionProps } from '../types';

export function ModernMinimalLocation({ hotel, theme }: LocationSectionProps) {
  const primary = sanitizeColor(theme.primaryColor, '#2563eb');

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: primary }}>
              Location
            </p>
            <h2
              className="text-3xl font-light text-gray-900 tracking-tight mb-6"
              style={{ fontFamily: theme.fontFamily }}
            >
              How to find us
            </h2>
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: primary }} />
              <div className="text-sm">
                <p className="text-gray-900">{sanitizeText(hotel.address)}</p>
                <p className="text-gray-500">{sanitizeText(hotel.city)}, {sanitizeText(hotel.state)} — {sanitizeText(hotel.pincode)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-8">
              <Clock className="w-4 h-4" style={{ color: primary }} />
              Check-in: {hotel.checkInTime || '2:00 PM'} &middot; Check-out: {hotel.checkOutTime || '11:00 AM'}
            </div>
            <Link href="/contact">
              <Button variant="outline" className="rounded-full">Get Directions</Button>
            </Link>
          </div>
          <div className="h-72 bg-gray-100 rounded-2xl flex items-center justify-center">
            <p className="text-gray-400 text-sm">Map</p>
          </div>
        </div>
      </div>
    </section>
  );
}
