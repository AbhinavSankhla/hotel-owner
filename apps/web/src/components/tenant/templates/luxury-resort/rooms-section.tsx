'use client';

/**
 * Luxury Resort Template — Rooms Section
 * Alternating left/right layout with large images, editorial feel.
 */

import Image from 'next/image';
import Link from 'next/link';
import { Users, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sanitizeColor, sanitizeImageUrl, sanitizeText } from '@/lib/security/sanitize';
import { getAmenityLabel } from '../shared/amenities';
import type { RoomsSectionProps } from '../types';

export function LuxuryResortRooms({ hotel, theme }: RoomsSectionProps) {
  const primary = sanitizeColor(theme.primaryColor, '#2563eb');
  const accent = sanitizeColor(theme.accentColor, '#d4a574');
  const activeRooms = hotel.roomTypes?.filter((r) => r.isActive) || [];

  if (activeRooms.length === 0) return null;

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="w-12 h-px mx-auto mb-4" style={{ backgroundColor: accent }} />
          <h2
            className="text-3xl md:text-4xl text-gray-900 mb-3"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Accommodations
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto font-light">
            Discover our exquisitely appointed rooms and suites, each crafted for an unforgettable stay.
          </p>
        </div>

        <div className="space-y-16">
          {activeRooms.slice(0, 3).map((room, idx) => {
            const roomImg = sanitizeImageUrl(room.images?.[0]);
            const isReversed = idx % 2 !== 0;
            return (
              <div
                key={room.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${isReversed ? 'lg:direction-rtl' : ''}`}
              >
                {/* Image */}
                <div className={`relative aspect-[4/3] overflow-hidden ${isReversed ? 'lg:order-2' : ''}`}>
                  {roomImg ? (
                    <Image
                      src={roomImg}
                      alt={sanitizeText(room.name)}
                      fill
                      className="object-cover hover:scale-[1.02] transition-transform duration-1000"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                  )}
                  {hotel.bookingModel === 'BOTH' && room.basePriceHourly && (
                    <div className="absolute top-4 left-4 bg-white/90 text-xs font-medium px-3 py-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Hourly Available
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className={`py-6 lg:px-8 ${isReversed ? 'lg:order-1' : ''}`}>
                  <div className="w-8 h-px mb-4" style={{ backgroundColor: accent }} />
                  <h3
                    className="text-2xl text-gray-900 mb-3"
                    style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
                  >
                    {sanitizeText(room.name)}
                  </h3>
                  <p className="text-gray-500 font-light mb-4 leading-relaxed">
                    {sanitizeText(room.description) || `A refined space for up to ${room.maxGuests} guests.`}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="flex items-center gap-1 text-sm text-gray-400">
                      <Users className="w-3.5 h-3.5" /> Up to {room.maxGuests}
                    </span>
                    {room.amenities.slice(0, 3).map((a) => (
                      <span key={a} className="text-sm text-gray-400">
                        &middot; {getAmenityLabel(a)}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-2xl"
                        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300 }}
                      >
                        ₹{room.basePriceDaily.toLocaleString('en-IN')}
                      </span>
                      <span className="text-sm text-gray-400">/ night</span>
                    </div>
                    <Link href={`/hotel/rooms/${room.id}`}>
                      <Button
                        variant="outline"
                        className="border-gray-300 hover:bg-gray-50 gap-2"
                      >
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activeRooms.length > 3 && (
          <div className="text-center mt-16">
            <Link href="/hotel/rooms">
              <Button variant="outline" size="lg" className="border-gray-300 px-8">
                Explore All Rooms ({activeRooms.length})
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
