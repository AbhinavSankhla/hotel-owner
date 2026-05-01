'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import dayjs from 'dayjs';

export default function BookingsListPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/auth/login');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingData(true);
    userApi.getMyBookings({ page, limit: 10 })
      .then((res) => {
        setBookings(res.data.data?.data || []);
        setTotalPages(res.data.data?.pages || 1);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [isAuthenticated, page]);

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    CHECKED_IN: 'bg-green-100 text-green-800',
    CHECKED_OUT: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

      {loadingData ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-3xl mb-3">🗓️</p>
          <p className="font-medium">No bookings yet</p>
          <Link href="/" className="btn-primary mt-4 text-sm">Browse Rooms</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link key={b.id} href={`/bookings/${b.id}`} className="card p-4 flex justify-between items-center hover:shadow-md transition-shadow">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-gray-400 mb-0.5">{b.bookingNumber}</p>
                <p className="font-semibold text-gray-900 truncate">{b.hotel?.name}</p>
                <p className="text-sm text-gray-500">{b.roomType?.name} • {dayjs(b.checkInDate).format('DD MMM')} – {dayjs(b.checkOutDate).format('DD MMM YYYY')}</p>
              </div>
              <div className="text-right ml-4 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[b.status] || 'bg-gray-100'}`}>{b.status}</span>
                <p className="font-bold text-gray-900 mt-1">{formatCurrency(b.totalAmount)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-3 py-1.5">← Prev</button>
          <span className="px-4 py-1.5 text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-sm px-3 py-1.5">Next →</button>
        </div>
      )}
    </main>
  );
}
