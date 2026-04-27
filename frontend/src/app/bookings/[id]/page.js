'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { bookingsApi } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function BookingDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/auth/login');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!id) return;
    bookingsApi.getById(id)
      .then((res) => setBooking(res.data.data))
      .catch(() => toast.error('Could not load booking'))
      .finally(() => setLoadingBooking(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    try {
      const res = await bookingsApi.cancel(id, { reason: 'Guest requested cancellation' });
      setBooking(res.data.data);
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  if (loadingBooking) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 rounded-full border-b-2 border-primary-600" /></div>;
  if (!booking) return <div className="text-center py-20 text-gray-400">Booking not found</div>;

  const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.status);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">← Back</button>
        <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
      </div>

      <div className="card p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="font-mono text-sm text-gray-500">{booking.bookingNumber}</p>
            <h2 className="text-xl font-semibold mt-1">{booking.hotel?.name}</h2>
            <p className="text-gray-500 text-sm">{booking.roomType?.name}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
            booking.status === 'CHECKED_IN' ? 'bg-green-100 text-green-700' :
            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
            booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-600'
          }`}>{booking.status}</span>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Check-in</p>
            <p className="font-semibold">{dayjs(booking.checkInDate).format('ddd, DD MMM YYYY')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Check-out</p>
            <p className="font-semibold">{dayjs(booking.checkOutDate).format('ddd, DD MMM YYYY')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Guests</p>
            <p className="font-semibold">{booking.numGuests}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Rooms</p>
            <p className="font-semibold">{booking.numRooms}</p>
          </div>
        </div>

        {/* Guest Info */}
        <div>
          <h3 className="font-semibold mb-2">Guest Information</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>{booking.guestName}</p>
            {booking.guestEmail && <p>{booking.guestEmail}</p>}
            {booking.guestPhone && <p>{booking.guestPhone}</p>}
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t pt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Room charges</span>
            <span>{formatCurrency(booking.roomTotal)}</span>
          </div>
          {booking.extraGuestTotal > 0 && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Extra guest charges</span>
              <span>{formatCurrency(booking.extraGuestTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Taxes & fees</span>
            <span>{formatCurrency(booking.taxes)}</span>
          </div>
          {booking.discountAmount > 0 && (
            <div className="flex justify-between text-sm mb-1 text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(booking.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t">
            <span>Total</span>
            <span>{formatCurrency(booking.totalAmount)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Payment: {booking.paymentStatus}</p>
        </div>

        {/* Actions */}
        {canCancel && (
          <div className="pt-2">
            <button onClick={handleCancel} disabled={cancelling} className="w-full py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-medium text-sm transition-colors">
              {cancelling ? 'Cancelling…' : 'Cancel Booking'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
