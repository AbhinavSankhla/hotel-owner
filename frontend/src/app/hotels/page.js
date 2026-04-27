import { serverHotelsApi } from '@/lib/serverApi';
import Link from 'next/link';

export const metadata = { title: 'All Hotels', description: 'Browse all available hotels' };

async function getHotels(searchParams) {
  try {
    const res = await serverHotelsApi.list({
      page: searchParams.page || 1,
      limit: 20,
      city: searchParams.city,
      starRating: searchParams.stars,
      bookingModel: searchParams.type,
    });
    return res.data || { data: [], total: 0, pages: 1 };
  } catch {
    return { data: [], total: 0, pages: 1 };
  }
}

export default async function HotelsPage({ searchParams }) {
  const params = await searchParams;
  const { data: hotels, total, pages, page } = await getHotels(params);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">All Hotels</h1>
      <p className="text-gray-500 mb-8">{total} hotels found</p>

      {hotels.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No hotels found. Try different filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <Link key={hotel.id} href={`/hotels/${hotel.slug}`} className="card hover:shadow-md transition-shadow group">
              <div className="h-48 bg-gray-100 overflow-hidden">
                {hotel.coverImageUrl ? (
                  <img src={hotel.coverImageUrl} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">🏨</div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-gray-900 truncate">{hotel.name}</h2>
                <p className="text-gray-500 text-sm">{hotel.city}, {hotel.state}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-primary-600 font-medium text-sm">
                    {hotel.startingPrice ? `From ₹${hotel.startingPrice}` : 'View prices'}
                  </span>
                  {hotel.avgRating && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">★ {hotel.avgRating}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/hotels?page=${p}`}
              className={`px-4 py-2 rounded border text-sm ${parseInt(params.page) === p ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
