'use client';

import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sanitizeColor, sanitizeText } from '@/lib/security/sanitize';
import type { LocationSectionProps } from '../types';

export function LuxuryResortLocation({ hotel, theme }: LocationSectionProps) {
  const accent = sanitizeColor(theme.accentColor, '#d4a574');

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="w-8 h-px mb-4" style={{ backgroundColor: accent }} />
            <h2
              className="text-3xl text-gray-900 mb-6"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
            >
              Find Us
            </h2>
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: accent }} />
              <div className="text-sm">
                <p className="text-gray-900">{sanitizeText(hotel.address)}</p>
                <p className="text-gray-500">{sanitizeText(hotel.city)}, {sanitizeText(hotel.state)} — {sanitizeText(hotel.pincode)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-8">
              <Clock className="w-4 h-4" style={{ color: accent }} />
              Check-in: {hotel.checkInTime || '2:00 PM'} &middot; Check-out: {hotel.checkOutTime || '11:00 AM'}
            </div>
            <Link href="/hotel/contact">
              <Button variant="outline" className="border-gray-300">Get Directions</Button>
            </Link>
          </div>
          <div className="h-80 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Map</p>
          </div>
        </div>
      </div>
    </section>
  );
}
