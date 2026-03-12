'use client';

/**
 * Heritage Boutique Template — Rooms Section
 * Storybook-style cards with warm tones, serif headings, ornamental accents.
 */

import Image from 'next/image';
import Link from 'next/link';
import { Users, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sanitizeColor, sanitizeImageUrl, sanitizeText } from '@/lib/security/sanitize';
import { getAmenityLabel } from '../shared/amenities';
import type { RoomsSectionProps } from '../types';

export function HeritageBoutiqueRooms({ hotel, theme }: RoomsSectionProps) {
  const primary = sanitizeColor(theme.primaryColor, '#92400e');
  const accent = sanitizeColor(theme.accentColor, '#b45309');
  const activeRooms = hotel.roomTypes?.filter((r) => r.isActive) || [];

  if (activeRooms.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading with ornament */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-px" style={{ backgroundColor: accent }} />
            <div className="w-2 h-2 rotate-45 border" style={{ borderColor: accent }} />
            <div className="w-12 h-px" style={{ backgroundColor: accent }} />
          </div>
          <h2
            className="text-3xl md:text-4xl text-stone-800 mb-3"
            style={{ fontFamily: "'Playfair Display', 'Lora', serif", fontWeight: 400 }}
          >
            Our Rooms & Suites
          </h2>
          <p className="text-stone-500 max-w-lg mx-auto" style={{ fontFamily: "'Lora', serif" }}>
            Each room tells a story — steeped in tradition, designed for comfort.
          </p>
        </div>

        {/* Room cards — storybook-style grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activeRooms.slice(0, 4).map((room) => {
            const roomImg = sanitizeImageUrl(room.images?.[0]);
            return (
              <div
                key={room.id}
                className="bg-white border border-stone-200 overflow-hidden group hover:shadow-lg transition-shadow duration-500"
              >
                {/* Image with warm overlay on hover */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  {roomImg ? (
                    <Image
                      src={roomImg}
                      alt={sanitizeText(room.name)}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-50 to-stone-100" />
                  )}
                  {hotel.bookingModel === 'BOTH' && room.basePriceHourly && (
                    <div className="absolute top-3 left-3 bg-white/90 text-xs font-medium px-3 py-1 flex items-center gap-1 text-stone-700">
                      <Clock className="w-3 h-3" /> Hourly Available
                    </div>
                  )}
                  {/* Warm gradient overlay at bottom */}
                  <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3
                    className="text-xl text-stone-800 mb-2"
                    style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
                  >
                    {sanitizeText(room.name)}
                  </h3>
                  <p
                    className="text-stone-500 text-sm mb-4 leading-relaxed line-clamp-2"
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    {sanitizeText(room.description) || `A charming retreat for up to ${room.maxGuests} guests.`}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="flex items-center gap-1 text-xs text-stone-500 bg-stone-50 px-2 py-1 rounded">
                      <Users className="w-3 h-3" /> Up to {room.maxGuests}
                    </span>
                    {room.amenities.slice(0, 3).map((a) => (
                      <span key={a} className="text-xs text-stone-500 bg-stone-50 px-2 py-1 rounded">
                        {getAmenityLabel(a)}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-2xl text-stone-800"
                        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
                      >
                        ₹{room.basePriceDaily.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-stone-400">/ night</span>
                    </div>
                    <Link href={`/hotel/rooms/${room.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-stone-300 hover:bg-stone-50 gap-1.5 text-stone-600"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activeRooms.length > 4 && (
          <div className="text-center mt-12">
            <Link href="/hotel/rooms">
              <Button
                variant="outline"
                size="lg"
                className="border-stone-300 text-stone-600 hover:bg-stone-100 px-8"
              >
                View All Rooms ({activeRooms.length})
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
