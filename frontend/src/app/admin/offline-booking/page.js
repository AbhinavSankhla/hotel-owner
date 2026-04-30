'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const PAYMENT_METHODS = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER'];

export default function OfflineBookingPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [roomTypes, setRoomTypes] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [bookingType, setBookingType] = useState('DAILY');
  const [lastBooking, setLastBooking] = useState(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      bookingType: 'DAILY',
      numRooms: 1,
      numGuests: 1,
      numExtraGuests: 0,
      paymentMethod: 'CASH',
      checkInDate: dayjs().format('YYYY-MM-DD'),
      checkOutDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    },
  });

  const watchedFields = watch(['roomTypeId', 'checkInDate', 'checkOutDate', 'numRooms', 'numExtraGuests', 'numHours']);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !['HOTEL_ADMIN', 'HOTEL_STAFF'].includes(user?.role))) {
      router.replace('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    adminApi.listRoomTypes({})
      .then((res) => setRoomTypes(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingRooms(false));
  }, [isAuthenticated]);

  // Real-time price preview
  useEffect(() => {
    const [roomTypeId, checkInDate, checkOutDate, numRooms, numExtraGuests, numHours] = watchedFields;
    if (!roomTypeId) { setPreview(null); return; }

    const rt = roomTypes.find((r) => r.id === roomTypeId);
    if (!rt) { setPreview(null); return; }

    let subtotal = 0;
    let nights = 0;
    let hours = 0;

    if (bookingType === 'DAILY' && checkInDate && checkOutDate) {
      nights = dayjs(checkOutDate).diff(dayjs(checkInDate), 'day');
      if (nights < 1) { setPreview(null); return; }
      subtotal = (rt.basePriceDaily || 0) * nights * (parseInt(numRooms) || 1);
    } else if (bookingType === 'HOURLY' && numHours) {
      hours = parseInt(numHours) || 1;
      subtotal = (rt.basePriceHourly || rt.basePriceDaily / 12) * hours * (parseInt(numRooms) || 1);
    }

    const extraCharge = (rt.extraGuestCharge || 0) * (parseInt(numExtraGuests) || 0) * (bookingType === 'DAILY' ? nights : hours);
    const taxRate = 0.12;
    const taxAmount = Math.round((subtotal + extraCharge) * taxRate);
    const total = subtotal + extraCharge + taxAmount;

    setPreview({ subtotal, extraCharge, taxAmount, total, nights, hours, rtName: rt.name });
  }, [watchedFields, bookingType, roomTypes]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await adminApi.createOfflineBooking({ ...data, bookingType });
      const booking = res.data.data;
      setLastBooking(booking);
      toast.success(`Booking ${booking.bookingNumber} created!`);
      reset({
        bookingType: 'DAILY',
        numRooms: 1,
        numGuests: 1,
        numExtraGuests: 0,
        paymentMethod: 'CASH',
        checkInDate: dayjs().format('YYYY-MM-DD'),
        checkOutDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
      });
      setPreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">← Admin</Link>
        <h1 className="text-2xl font-bold text-gray-900">Walk-in / Counter Booking</h1>
        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">Offline</span>
      </div>

      {/* Last booking confirmation */}
      {lastBooking && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-green-800">✅ Booking confirmed: <span className="font-mono">{lastBooking.bookingNumber}</span></p>
            <p className="text-green-700 text-sm mt-0.5">
              {lastBooking.guestName} · {formatCurrency(lastBooking.totalAmount)} · Status: {lastBooking.status}
            </p>
          </div>
          <Link href="/admin/bookings" className="text-sm text-green-700 underline whitespace-nowrap">View All</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Booking Type Toggle */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Booking Type</h2>
              <div className="flex gap-2">
                {['DAILY', 'HOURLY'].map((bt) => (
                  <button
                    key={bt}
                    type="button"
                    onClick={() => setBookingType(bt)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition ${
                      bookingType === bt
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {bt === 'DAILY' ? '🌙 Daily Booking' : '⏰ Hourly Booking'}
                  </button>
                ))}
              </div>
            </div>

            {/* Room & Dates */}
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Room & Dates</h2>
              <div>
                <label className="label">Room Type *</label>
                {loadingRooms ? (
                  <div className="input animate-pulse bg-gray-100" />
                ) : (
                  <select className="input" {...register('roomTypeId', { required: 'Select a room type' })}>
                    <option value="">— Select room type —</option>
                    {roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name} · {formatCurrency(rt.basePriceDaily)}/night
                        {rt.basePriceHourly ? ` · ${formatCurrency(rt.basePriceHourly)}/hr` : ''}
                      </option>
                    ))}
                  </select>
                )}
                {errors.roomTypeId && <p className="error-message">{errors.roomTypeId.message}</p>}
              </div>

              {bookingType === 'DAILY' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Check-in Date *</label>
                    <input type="date" className="input" {...register('checkInDate', { required: true })} />
                  </div>
                  <div>
                    <label className="label">Check-out Date *</label>
                    <input type="date" className="input" {...register('checkOutDate', { required: true })} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Check-in *</label>
                    <input type="datetime-local" className="input" {...register('checkInTime', { required: true })} />
                  </div>
                  <div>
                    <label className="label">Check-out *</label>
                    <input type="datetime-local" className="input" {...register('checkOutTime', { required: true })} />
                  </div>
                  <div>
                    <label className="label">Hours *</label>
                    <input type="number" min="1" max="23" className="input" {...register('numHours', { required: true, min: 1 })} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Rooms</label>
                  <input type="number" min="1" className="input" {...register('numRooms', { min: 1 })} />
                </div>
                <div>
                  <label className="label">Guests</label>
                  <input type="number" min="1" className="input" {...register('numGuests', { min: 1 })} />
                </div>
                <div>
                  <label className="label">Extra Guests</label>
                  <input type="number" min="0" className="input" {...register('numExtraGuests', { min: 0 })} />
                </div>
              </div>
            </div>

            {/* Guest Info */}
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Guest Information</h2>
              <div>
                <label className="label">Guest Name *</label>
                <input className="input" placeholder="Full name" {...register('guestName', { required: 'Name is required' })} />
                {errors.guestName && <p className="error-message">{errors.guestName.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <input className="input" placeholder="+91 98765 43210" {...register('guestPhone')} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" placeholder="guest@example.com" {...register('guestEmail')} />
                </div>
              </div>
              <div>
                <label className="label">Notes / Special Requests</label>
                <textarea className="input h-20 resize-none" placeholder="Any special requirements…" {...register('notes')} />
              </div>
            </div>

            {/* Payment */}
            <div className="card p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">Payment Method</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((pm) => (
                  <label key={pm} className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 has-[:checked]:bg-primary-50 has-[:checked]:border-primary-400 transition">
                    <input type="radio" value={pm} {...register('paymentMethod')} />
                    <span className="text-sm font-medium">{pm === 'BANK_TRANSFER' ? 'Bank Transfer' : pm.charAt(0) + pm.slice(1).toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-4 text-base font-semibold"
            >
              {submitting ? 'Creating Booking…' : '✅ Confirm Walk-in Booking'}
            </button>
          </form>
        </div>

        {/* Price Preview */}
        <div>
          <div className="card p-5 sticky top-6">
            <h2 className="font-semibold text-gray-900 mb-4">Price Summary</h2>
            {preview ? (
              <div className="space-y-3 text-sm">
                <div className="text-center py-3 bg-gray-50 rounded-xl mb-4">
                  <p className="text-gray-500">Room</p>
                  <p className="font-semibold text-gray-900">{preview.rtName}</p>
                  {preview.nights > 0 && <p className="text-gray-500 text-xs">{preview.nights} night(s)</p>}
                  {preview.hours > 0 && <p className="text-gray-500 text-xs">{preview.hours} hour(s)</p>}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Room charges</span>
                  <span>{formatCurrency(preview.subtotal)}</span>
                </div>
                {preview.extraCharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Extra guest charge</span>
                    <span>{formatCurrency(preview.extraCharge)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">GST (12%)</span>
                  <span>{formatCurrency(preview.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-3 mt-2">
                  <span>Total</span>
                  <span className="text-primary-600">{formatCurrency(preview.total)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">🧾</p>
                <p className="text-sm">Select a room and dates to see the price breakdown</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
