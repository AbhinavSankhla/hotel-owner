'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { analyticsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

function StatCard({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [trends, setTrends] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [occupancy, setOccupancy] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'HOTEL_ADMIN')) router.replace('/dashboard');
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0];
    const end = now.toISOString().split('T')[0];

    Promise.allSettled([
      analyticsApi.getBookingTrends({ startDate: start, endDate: end }),
      analyticsApi.getRevenueReport({ startDate: start, endDate: end }),
      analyticsApi.getOccupancy({ startDate: start, endDate: end }),
    ]).then(([t, r, o]) => {
      if (t.status === 'fulfilled') setTrends(t.value.data.data || []);
      if (r.status === 'fulfilled') setRevenue(r.value.data.data || null);
      if (o.status === 'fulfilled') setOccupancy(o.value.data.data || null);
    }).finally(() => setLoadingData(false));
  }, [isAuthenticated]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      {loadingData ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Revenue summary */}
          {revenue && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Revenue" value={formatCurrency(revenue.totalRevenue || 0)} />
              <StatCard label="Total Bookings" value={revenue.totalBookings || 0} />
              <StatCard label="Avg Booking Value" value={formatCurrency(revenue.avgBookingValue || 0)} />
              <StatCard label="Refunds" value={formatCurrency(revenue.totalRefunds || 0)} />
            </div>
          )}

          {/* Booking trends table */}
          <div className="card p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">Booking Trends (Last 6 Months)</h2>
            {trends.length === 0 ? (
              <p className="text-gray-400 text-sm">No data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Month</th>
                      <th className="pb-2">Bookings</th>
                      <th className="pb-2">Revenue</th>
                      <th className="pb-2">Cancelled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {trends.map((t, i) => (
                      <tr key={i}>
                        <td className="py-2">{t.month}</td>
                        <td className="py-2">{t.totalBookings}</td>
                        <td className="py-2 font-medium">{formatCurrency(t.revenue || 0)}</td>
                        <td className="py-2 text-red-500">{t.cancelledBookings || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Occupancy by room type */}
          {occupancy?.byRoomType?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Occupancy by Room Type</h2>
              <div className="space-y-3">
                {occupancy.byRoomType.map((rt, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{rt.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, rt.occupancyRate || 0)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-12 text-right">
                        {(rt.occupancyRate || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
