'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Modal from '@/components/ui/Modal';
import { bookingsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  CHECKED_IN: 'bg-green-100 text-green-800',
  CHECKED_OUT: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-orange-100 text-orange-800',
};

// Full booking details modal — used by Admin Dashboard (Recent Bookings) and
// Admin > Manage Bookings tables. Fetches the complete booking record (including
// hotel/room type/guest relations and pricing breakdown) by id, since list
// endpoints only return a trimmed subset of fields.
export default function BookingDetailsModal({ bookingId, onClose }) {
  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    setLoadingBooking(true);
    setError(false);
    bookingsApi.getById(bookingId)
      .then((res) => setBooking(res.data.data))
      .catch(() => setError(true))
      .finally(() => setLoadingBooking(false));
  }, [bookingId]);

  return (
    <Modal open={!!bookingId} onClose={onClose} title="Booking Details" maxWidth="max-w-lg">
      {loadingBooking ? (
        <div className="py-10 flex items-center justify-center">
          <span className="animate-spin h-6 w-6 rounded-full border-b-2 border-primary-600" />
        </div>
      ) : error || !booking ? (
        <p className="text-center py-10 text-gray-400">Could not load booking details.</p>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <p className="font-mono text-sm text-gray-500">{booking.bookingNumber}</p>
              <h3 className="text-lg font-semibold mt-1">{booking.guestName}</h3>
              <p className="text-gray-500 text-sm">{booking.roomType?.name}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-600'}`}>
              {booking.status}
            </span>
          </div>

          {/* Dates / Guests / Rooms */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            {booking.bookingType === 'HOURLY' ? (
              <>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Check-in</p>
                  <p className="font-semibold">{booking.checkInTime ? dayjs(booking.checkInTime).format('DD MMM YYYY, HH:mm') : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Check-out</p>
                  <p className="font-semibold">{booking.checkOutTime ? dayjs(booking.checkOutTime).format('DD MMM YYYY, HH:mm') : '—'}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Check-in</p>
                  <p className="font-semibold">{booking.checkInDate ? dayjs(booking.checkInDate).format('ddd, DD MMM YYYY') : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Check-out</p>
                  <p className="font-semibold">{booking.checkOutDate ? dayjs(booking.checkOutDate).format('ddd, DD MMM YYYY') : '—'}</p>
                </div>
              </>
            )}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Number of Guests</p>
              <p className="font-semibold">{booking.numGuests}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Rooms</p>
              <p className="font-semibold">{booking.numRooms}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Adults</p>
              <p className="font-semibold">{booking.numAdults ?? booking.numGuests}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Children</p>
              <p className="font-semibold">{booking.numChildren ?? 0}</p>
            </div>
          </div>

          {/* Guest Info */}
          <div>
            <h4 className="font-semibold mb-2">Guest Information</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>{booking.guestName}</p>
              {booking.guestEmail && <p>{booking.guestEmail}</p>}
              {booking.guestPhone && <p>{booking.guestPhone}</p>}
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Room charges</span>
                <span className="font-medium">{formatCurrency(booking.roomTotal)}</span>
              </div>
              {booking.extraGuestTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Extra guest charges</span>
                  <span className="font-medium">{formatCurrency(booking.extraGuestTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">GST & taxes</span>
                <span className="font-medium">{formatCurrency(booking.taxes)}</span>
              </div>
              {booking.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount applied</span>
                  <span>−{formatCurrency(booking.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 mt-1 border-t border-gray-200">
                <span>Total Paid</span>
                <span className="text-primary-700">{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>
            <div className={`inline-flex items-center gap-1.5 mt-3 text-xs px-2.5 py-1 rounded-full font-medium ${
              booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
              booking.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              {booking.paymentStatus === 'PAID' ? '✓' : '○'} Payment: {booking.paymentStatus}
            </div>
          </div>

          {booking.specialRequests && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-1">Special Requests</h4>
              <p className="text-sm text-gray-600">{booking.specialRequests}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
