import { serverHotelsApi } from '@/lib/serverApi';
import Link from 'next/link';

const HOTEL_ID = '11111111-1111-1111-1111-111111111111';

const FALLBACK_ROOM_IMGS = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80',
];

export async function generateMetadata() {
  try {
    const res = await serverHotelsApi.getFeatured(1);
    const data = res.data ?? res ?? [];
    const arr = Array.isArray(data) ? data : [];
    const hotel = arr[0];
    return {
      title: `Rooms & Booking — ${hotel?.name || 'Hotel'}`,
      description: `Browse all room types and book your stay at ${hotel?.name || 'our hotel'}.`,
    };
  } catch {
    return { title: 'Rooms & Booking' };
  }
}

async function getHotelData() {
  try {
    const res = await serverHotelsApi.getFeatured(1);
    const data = res.data ?? res ?? [];
    const arr = Array.isArray(data) ? data : [];
    return arr[0] || null;
  } catch {
    return null;
  }
}

export default async function HotelBookPage() {
  const hotel = await getHotelData();
  const roomTypes = hotel?.roomTypes || [];

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <Link href="/" className="hover:text-primary-600 transition">Home</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">Rooms & Booking</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {hotel?.name || 'Our Rooms'}
        </h1>
        {hotel && (
          <p className="text-gray-500 flex items-center gap-2 text-sm">
            <span>📍</span>
            <span>{hotel.address}, {hotel.city}, {hotel.state}</span>
            {hotel.starRating && (
              <span className="flex gap-0.5 ml-2">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
              </span>
            )}
          </p>
        )}
        {hotel?.description && (
          <p className="text-gray-600 mt-3 max-w-2xl leading-relaxed">{hotel.description}</p>
        )}
      </div>

      {/* Hotel amenities strip */}
      {hotel?.amenities?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-100">
          {hotel.amenities.map((a) => (
            <span key={a} className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full font-medium">
              {a}
            </span>
          ))}
        </div>
      )}

      {/* Room Types Grid */}
      {roomTypes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🛏️</p>
          <p className="text-lg">No rooms available at the moment.</p>
          <p className="text-sm mt-1">Please check back soon or contact us directly.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {roomTypes.length} Room Type{roomTypes.length !== 1 ? 's' : ''} Available
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomTypes.map((rt, i) => {
              const img = rt.images?.[0] || FALLBACK_ROOM_IMGS[i % FALLBACK_ROOM_IMGS.length];
              return (
                <Link
                  key={rt.id}
                  href={`/rooms/${rt.id}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-gray-100 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden flex-shrink-0">
                    <img
                      src={img}
                      alt={rt.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {rt.basePriceHourly && (
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                        Hourly available
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{rt.name}</h3>

                    {/* Quick facts */}
                    <div className="flex gap-3 text-xs text-gray-500 mb-3">
                      {rt.maxGuests && <span>👥 Up to {rt.maxGuests} guests</span>}
                      {rt.bedType && <span>🛏️ {rt.bedType}</span>}
                      {rt.areaSqFt && <span>📐 {rt.areaSqFt} sq ft</span>}
                    </div>

                    {rt.description && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{rt.description}</p>
                    )}

                    {/* Amenities preview */}
                    {rt.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {rt.amenities.slice(0, 4).map((a) => (
                          <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
                        ))}
                        {rt.amenities.length > 4 && (
                          <span className="text-xs text-gray-400">+{rt.amenities.length - 4} more</span>
                        )}
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-auto">
                      <div>
                        <span className="text-2xl font-bold text-primary-600">
                          ₹{rt.basePriceDaily?.toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-sm"> /night</span>
                        {rt.basePriceHourly && (
                          <p className="text-xs text-gray-400 mt-0.5">₹{rt.basePriceHourly?.toLocaleString()}/hour</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-white bg-primary-600 group-hover:bg-primary-700 transition px-4 py-2 rounded-xl">
                        Book Now →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Hotel contact info */}
      {hotel && (hotel.phone || hotel.email) && (
        <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">Need help with your booking?</h3>
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            {hotel.phone && (
              <a href={`tel:${hotel.phone}`} className="flex items-center gap-2 hover:text-primary-600 transition">
                <span>📞</span> {hotel.phone}
              </a>
            )}
            {hotel.email && (
              <a href={`mailto:${hotel.email}`} className="flex items-center gap-2 hover:text-primary-600 transition">
                <span>✉️</span> {hotel.email}
              </a>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
