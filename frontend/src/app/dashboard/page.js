'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import dayjs from 'dayjs';

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/auth/login');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    userApi.getMyBookings({ limit: 5 })
      .then((res) => setBookings(res.data.data?.data || []))
      .catch(() => {})
      .finally(() => setLoadingBookings(false));
  }, [isAuthenticated]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    CHECKED_IN: 'bg-green-100 text-green-800',
    CHECKED_OUT: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
        <p className="text-gray-500 text-sm mt-1">{user.email || user.phone}</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { href: '/hotels', label: '🏨 Browse Hotels' },
          { href: '/bookings', label: '📋 My Bookings' },
          { href: '/user/profile', label: '👤 Profile' },
          user.role === 'HOTEL_ADMIN' ? { href: '/admin', label: '⚙️ Admin Panel' } : null,
        ].filter(Boolean).map((item) => (
          <Link key={item.href} href={item.href} className="card p-4 text-center text-sm font-medium text-gray-700 hover:shadow-md transition-shadow">
            {item.label}
          </Link>
        ))}
      </div>

      {/* Recent Bookings */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Bookings</h2>
          <Link href="/bookings" className="text-sm text-primary-600 hover:underline">View all</Link>
        </div>

        {loadingBookings ? (
          <div className="text-gray-400 text-sm py-8 text-center">Loading bookings…</div>
        ) : bookings.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <p className="text-2xl mb-2">🗓️</p>
            <p>No bookings yet</p>
            <Link href="/hotels" className="btn-primary mt-4 text-sm">Book a room</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <Link key={b.id} href={`/bookings/${b.id}`} className="card p-4 flex justify-between items-center hover:shadow-md transition-shadow">
                <div>
                  <p className="font-medium text-gray-900">{b.bookingNumber}</p>
                  <p className="text-sm text-gray-500">{b.roomType?.name} • {dayjs(b.checkInDate).format('DD MMM')} – {dayjs(b.checkOutDate).format('DD MMM YYYY')}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[b.status] || 'bg-gray-100'}`}>{b.status}</span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{formatCurrency(b.totalAmount)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
