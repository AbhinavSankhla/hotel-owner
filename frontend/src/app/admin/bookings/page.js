'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'];
const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  CHECKED_IN: 'bg-green-100 text-green-800',
  CHECKED_OUT: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-orange-100 text-orange-800',
};

export default function AdminBookingsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'HOTEL_ADMIN')) {
      router.replace('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);

  const fetchBookings = () => {
    setLoadingData(true);
    adminApi.listBookings({ page, limit: 20, ...(statusFilter ? { status: statusFilter } : {}) })
      .then((res) => {
        const d = res.data.data;
        setBookings(d?.data || []);
        setTotalPages(d?.pages || 1);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  };

  useEffect(() => { if (isAuthenticated) fetchBookings(); }, [isAuthenticated, page, statusFilter]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await adminApi.updateBookingStatus(id, { status });
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: res.data.data.status } : b));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input w-auto"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loadingData ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-gray-100 animate-pulse rounded" />)}</div>
      ) : bookings.length === 0 ? (
        <p className="text-center py-20 text-gray-400">No bookings found</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Booking #', 'Guest', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.bookingNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{b.guestName}</p>
                    <p className="text-gray-400 text-xs">{b.guestPhone || b.guestEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.roomType?.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{dayjs(b.checkInDate).format('DD MMM YY')}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{dayjs(b.checkOutDate).format('DD MMM YY')}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(b.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] || 'bg-gray-100'}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      disabled={updatingId === b.id}
                      value={b.status}
                      onChange={(e) => updateStatus(b.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-3 py-1.5">← Prev</button>
          <span className="text-sm text-gray-500 py-1.5">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-sm px-3 py-1.5">Next →</button>
        </div>
      )}
    </main>
  );
}
