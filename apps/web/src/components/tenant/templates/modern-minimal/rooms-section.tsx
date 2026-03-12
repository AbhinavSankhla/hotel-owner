'use client';

/**
 * Modern Minimal Template — Rooms Section
 * Clean card layout with minimal decoration, generous whitespace.
 */

import Image from 'next/image';
import Link from 'next/link';
import { Users, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sanitizeColor, sanitizeImageUrl, sanitizeText } from '@/lib/security/sanitize';
import { getAmenityIcon, getAmenityLabel } from '../shared/amenities';
import type { RoomsSectionProps } from '../types';

export function ModernMinimalRooms({ hotel, theme }: RoomsSectionProps) {
  const primary = sanitizeColor(theme.primaryColor, '#2563eb');
  const activeRooms = hotel.roomTypes?.filter((r) => r.isActive) || [];

  if (activeRooms.length === 0) return null;

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: primary }}>
            Accommodations
          </p>
          <h2
            className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight"
            style={{ fontFamily: theme.fontFamily }}
          >
            Rooms & Suites
          </h2>
          <p className="text-gray-500 mt-3 font-light leading-relaxed">
            Each room is thoughtfully designed for comfort and modern elegance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeRooms.slice(0, 3).map((room) => {
            const roomImg = sanitizeImageUrl(room.images?.[0]);
            return (
              <Link
                key={room.id}
                href={`/hotel/rooms/${room.id}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-4">
                  {roomImg ? (
                    <Image
                      src={roomImg}
                      alt={sanitizeText(room.name)}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-300 text-sm">No image</span>
                    </div>
                  )}
                  {hotel.bookingModel === 'BOTH' && room.basePriceHourly && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Hourly Available
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-1 group-hover:opacity-70 transition-opacity">
                  {sanitizeText(room.name)}
                </h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-1 font-light">
                  {sanitizeText(room.description) || `Up to ${room.maxGuests} guests`}
                </p>
                <div className="flex items-center gap-3 mb-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {room.maxGuests}
                  </span>
                  {room.amenities.slice(0, 2).map((a) => (
                    <span key={a} className="flex items-center gap-1">
                      {getAmenityIcon(a)}
                      <span className="hidden sm:inline">{getAmenityLabel(a)}</span>
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-light text-gray-900">
                      ₹{room.basePriceDaily.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-gray-400">/night</span>
                  </div>
                  <span
                    className="text-xs font-medium flex items-center gap-0.5 group-hover:gap-1.5 transition-all"
                    style={{ color: primary }}
                  >
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {activeRooms.length > 3 && (
          <div className="mt-12 text-center">
            <Link href="/hotel/rooms">
              <Button variant="outline" className="rounded-full px-8">
                View All Rooms ({activeRooms.length})
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
