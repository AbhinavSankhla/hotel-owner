import Link from 'next/link';
import { serverHotelsApi } from '@/lib/serverApi';
import HeroSlideshow from '@/components/ui/HeroSlideshow';

export const metadata = { title: 'Grand Horizon Hotel — Luxury Stays in Bangalore', description: 'Book your perfect stay at Grand Horizon Hotel. Luxury rooms, world-class amenities, and unbeatable hospitality in the heart of Bangalore.' };

const FALLBACK_ROOM_IMGS = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
];

// /uploads/... paths are proxied through Next.js rewrites (next.config.js)
function resolveImg(url) {
  if (!url) return null;
  if (url.startsWith('/uploads/') || url.startsWith('http')) return url;
  return null;
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

export default async function HomePage() {
  const firstHotel = await getHotelData();
  const roomTypes = firstHotel?.roomTypes || [];

  return (
    <main>
      {/* ── Hero Slideshow ───────────────────────────────────────────── */}
      <HeroSlideshow hotel={firstHotel} roomTypes={roomTypes} />

      {/* ── Room Types ───────────────────────────────────────────────── */}
      {roomTypes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Our Booking Types</h2>
            <p className="text-gray-500 text-lg">Choose your perfect accommodation from our curated selection</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roomTypes.map((rt, i) => {
              let imagesArr = rt.images;
              if (typeof imagesArr === 'string') {
                try { imagesArr = JSON.parse(imagesArr); } catch(e) {}
              }
              const img = resolveImg(Array.isArray(imagesArr) ? imagesArr[0] : null) || FALLBACK_ROOM_IMGS[i % FALLBACK_ROOM_IMGS.length];
              return (
                <Link key={rt.id} href={`/rooms/${rt.id}`} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-gray-100">
                  <div className="h-52 overflow-hidden">
                    <img src={img} alt={rt.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg">{rt.name}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{rt.description || `Sleeps up to ${rt.maxGuests} guests`}</p>
                    <div className="flex justify-between items-center mt-3">
                      <div>
                        <span className="text-primary-600 font-bold text-xl">₹{rt.basePriceDaily?.toLocaleString()}</span>
                        <span className="text-gray-400 text-sm">/night</span>
                      </div>
                      <span className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-medium">View Details</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Why Choose Us ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Why Grand Horizon?</h2>
          <p className="text-gray-500 text-lg">Everything you need for the perfect stay</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: '🏆', title: 'Award-Winning', desc: 'Recognized as Bangalore\'s best luxury hotel for 5 consecutive years' },
            { icon: '🍽️', title: 'Fine Dining', desc: 'Three in-house restaurants serving authentic Indian and international cuisine' },
            { icon: '💆', title: 'Spa & Wellness', desc: 'Full-service spa with over 30 rejuvenating treatments and therapies' },
            { icon: '📍', title: 'Prime Location', desc: 'Located on MG Road with easy access to shopping, dining, and business hubs' },
          ].map((item) => (
            <div key={item.title} className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready for Your Perfect Stay?</h2>
          <p className="text-primary-100 text-lg mb-8">Book now and experience unparalleled luxury at Grand Horizon Hotel</p>
          <div className="flex gap-4 justify-center flex-wrap">
            {firstHotel && (
              <Link href="/hotel/book" className="bg-white text-primary-700 hover:bg-primary-50 font-bold px-8 py-4 rounded-xl text-lg transition shadow-lg">
                Book Now
              </Link>
            )}
            <Link href="/auth/register" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-lg transition">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
