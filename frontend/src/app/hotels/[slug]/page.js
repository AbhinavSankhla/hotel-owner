import { serverHotelsApi, serverReviewsApi } from '@/lib/serverApi';
import { notFound } from 'next/navigation';
import BookingWidget from '@/components/booking/BookingWidget';
import RoomImageSlideshow from '@/components/rooms/RoomImageSlideshow';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80';
const FALLBACK_ROOM_IMG = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80';

const amenityIcons = {
  'Free WiFi': '📶', 'Rooftop Pool': '🏊', 'Spa & Wellness': '💆', 'Fine Dining': '🍽️',
  'Fitness Center': '🏋️', 'Business Center': '💼', 'Conference Rooms': '🤝',
  'Valet Parking': '🅿️', 'Airport Transfer': '✈️', '24h Room Service': '🛎️',
  'Bar & Lounge': '🍸', 'Kids Play Area': '🎠', 'AC': '❄️', 'Smart TV': '📺',
  'Jacuzzi': '🛁', 'Butler Service': '🤵', 'Balcony': '🌅', 'King Bed': '🛏️',
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const res = await serverHotelsApi.getBySlug(slug);
    const hotel = res.data;
    return {
      title: `${hotel.name} — Rooms & Booking`,
      description: hotel.description?.slice(0, 160),
    };
  } catch {
    return { title: 'Hotel Not Found' };
  }
}

async function getHotelData(slug) {
  const hotelRes = await serverHotelsApi.getBySlug(slug).catch(() => null);
  if (!hotelRes) return null;

  const hotel = hotelRes.data;
  const statsRes = await serverReviewsApi.getStats(hotel.id).catch(() => null);
  const stats = statsRes?.data || null;

  return { hotel, stats };
}

export default async function HotelDetailPage({ params }) {
  const { slug } = await params;
  const result = await getHotelData(slug);
  if (!result) notFound();

  const { hotel, stats } = result;
  const roomTypes = hotel.roomTypes || [];

  return (
    <main>
      {/* ── Hero Image ───────────────────────────────────────────────── */}
      <div className="relative h-[50vh] min-h-[320px] overflow-hidden">
        <img
          src={hotel.coverImageUrl || FALLBACK_IMG}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            {hotel.starRating && (
              <div className="flex gap-1 mb-2">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{hotel.name}</h1>
            <p className="text-white/80 text-lg flex items-center gap-2">
              <span>📍</span>
              <span>{hotel.address}, {hotel.city}, {hotel.state}</span>
            </p>
            {stats?.averageRating && (
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-green-500 text-white text-sm px-3 py-0.5 rounded-full font-semibold">
                  ⭐ {stats.averageRating}
                </span>
                <span className="text-white/70 text-sm">{stats.totalReviews} verified reviews</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Column ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            {hotel.description && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">About {hotel.name}</h2>
                <p className="text-gray-600 leading-relaxed text-base">{hotel.description}</p>

                {/* Hotel Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {[
                    { label: 'Check-in', value: hotel.checkInTime || '14:00' },
                    { label: 'Check-out', value: hotel.checkOutTime || '12:00' },
                    { label: 'Star Rating', value: `${hotel.starRating} Stars` },
                    { label: 'Booking', value: hotel.bookingModel || 'Daily' },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-gray-400 text-xs uppercase tracking-wide">{item.label}</p>
                      <p className="text-gray-900 font-semibold mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Amenities */}
            {hotel.amenities?.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Hotel Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {hotel.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
                      <span className="text-xl">{amenityIcons[a] || '✓'}</span>
                      <span className="text-gray-700 text-sm font-medium">{a}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Room Types */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Room Types</h2>
              <div className="space-y-6">
                {roomTypes.length === 0 ? (
                  <p className="text-gray-400 py-8 text-center">No rooms configured yet.</p>
                ) : roomTypes.map((rt) => {
                  return (
                    <div key={rt.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                      <div className="flex flex-col sm:flex-row">
                        {/* Room Images Slideshow */}
                        <div className="sm:w-64 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
                          <RoomImageSlideshow images={rt.images || []} alt={rt.name} fallback={FALLBACK_ROOM_IMG} />
                        </div>
                        {/* Room Details */}
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start flex-wrap gap-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-xl">{rt.name}</h3>
                              {rt.description && (
                                <p className="text-gray-500 text-sm mt-2 leading-relaxed">{rt.description}</p>
                              )}

                              {/* Room details */}
                              <div className="flex gap-4 mt-3 text-sm text-gray-500">
                                <span>👥 Up to {rt.maxGuests} guests</span>
                                {rt.maxExtraGuests > 0 && <span>+{rt.maxExtraGuests} extra</span>}
                                <span>🏠 {rt.totalRooms} rooms</span>
                              </div>

                              {rt.amenities?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {rt.amenities.slice(0, 6).map((a) => (
                                    <span key={a} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                                      {amenityIcons[a] || '·'} {a}
                                    </span>
                                  ))}
                                  {rt.amenities.length > 6 && (
                                    <span className="text-xs text-gray-400">+{rt.amenities.length - 6} more</span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="text-right min-w-[100px]">
                              {rt.basePriceDaily && (
                                <div>
                                  <p className="text-gray-400 text-xs">Per night</p>
                                  <p className="font-bold text-primary-600 text-2xl">₹{rt.basePriceDaily.toLocaleString()}</p>
                                </div>
                              )}
                              {rt.basePriceHourly && (
                                <div className="mt-1">
                                  <p className="text-gray-400 text-xs">Per hour</p>
                                  <p className="font-semibold text-gray-700">₹{rt.basePriceHourly.toLocaleString()}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* ── Right Column — Booking Widget ───────────────────────── */}
          <div className="lg:col-span-1">
            <BookingWidget hotel={hotel} roomTypes={roomTypes} />
          </div>
        </div>
      </div>
    </main>
  );
}
