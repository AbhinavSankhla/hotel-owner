'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi, analyticsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import dayjs from 'dayjs';

const StatCard = ({ label, value, sub }) => (
  <div className="card p-5">
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'HOTEL_ADMIN')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role !== 'HOTEL_ADMIN') return;
    adminApi.getDashboard()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, [user]);

  if (loading || !user) return null;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/admin/rooms" className="btn-secondary text-sm">Manage Rooms</Link>
          <Link href="/admin/bookings" className="btn-secondary text-sm">Bookings</Link>
          <Link href="/admin/analytics" className="btn-secondary text-sm">Analytics</Link>
          <Link href="/admin/settings" className="btn-primary text-sm">Settings</Link>
        </div>
      </div>

      {loadingStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="card p-5 h-24 animate-pulse bg-gray-100" />)}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Month Bookings" value={stats.monthBookings} />
            <StatCard label="Pending" value={stats.pendingBookings} />
            <StatCard label="Today Check-ins" value={stats.todayCheckIns} />
            <StatCard label="Today Check-outs" value={stats.todayCheckOuts} />
            <StatCard label="Month Revenue" value={formatCurrency(stats.monthRevenue)} />
            <StatCard label="Occupancy Rate" value={`${stats.occupancyRate}%`} />
            <StatCard label="Total Bookings" value={stats.totalBookings} />
            <StatCard label="Staff" value="View" sub="Manage team" />
          </div>

          {/* Recent Bookings */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Booking #', 'Guest', 'Room', 'Dates', 'Total', 'Status'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(stats.recentBookings || []).map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{b.bookingNumber}</td>
                      <td className="px-4 py-3">{b.guest?.name || b.guestName}</td>
                      <td className="px-4 py-3">{b.roomType?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {b.checkInDate ? `${dayjs(b.checkInDate).format('DD MMM')} – ${dayjs(b.checkOutDate).format('DD MMM')}` : '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(b.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${b.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' : b.status === 'CHECKED_IN' ? 'bg-green-100 text-green-700' : b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-400">Could not load dashboard stats.</p>
      )}
    </main>
  );
}
