'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { bookingsApi, roomsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function BookingWidget({ hotel, roomTypes }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedRoomType, setSelectedRoomType] = useState(roomTypes[0]?.id || '');
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [booking, setBooking] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { checkInDate: today, checkOutDate: tomorrow, numRooms: 1, numGuests: 1 },
  });

  const selectedRT = roomTypes.find((rt) => rt.id === selectedRoomType);
  const bookingModel = hotel.bookingModel || 'DAILY';

  const checkAvailability = async (data) => {
    if (!selectedRoomType) return;
    setChecking(true);
    setAvailability(null);
    try {
      const res = await roomsApi.checkDailyAvailability({
        roomTypeId: selectedRoomType,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        numRooms: data.numRooms,
      });
      setAvailability(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check availability');
    } finally {
      setChecking(false);
    }
  };

  const onBook = async (data) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to make a booking');
      router.push('/auth/login');
      return;
    }

    setBooking(true);
    try {
      const res = await bookingsApi.createDaily({
        hotelId: hotel.id,
        roomTypeId: selectedRoomType,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        numRooms: parseInt(data.numRooms),
        numGuests: parseInt(data.numGuests),
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        guestEmail: data.guestEmail,
      });
      const bookingId = res.data.data.id;
      toast.success('Booking created!');
      router.push(`/bookings/${bookingId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="card p-6 sticky top-4">
      <h3 className="text-lg font-semibold mb-4">Book Stay Here</h3>

      {/* Room Type Selector */}
      {roomTypes.length > 1 && (
        <div className="mb-4">
          <label className="label">Room Type</label>
          <select className="input" value={selectedRoomType} onChange={(e) => setSelectedRoomType(e.target.value)}>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>{rt.name} — ₹{rt.basePriceDaily}/night</option>
            ))}
          </select>
        </div>
      )}

      <form onSubmit={handleSubmit(availability ? onBook : checkAvailability)} className="space-y-4">
        <div>
          <label className="label">Check-in Date</label>
          <input type="date" className="input" min={new Date().toISOString().split('T')[0]} {...register('checkInDate', { required: 'Check-in date is required' })} />
          {errors.checkInDate && <p className="error-message">{errors.checkInDate.message}</p>}
        </div>

        <div>
          <label className="label">Check-out Date</label>
          <input type="date" className="input" min={new Date().toISOString().split('T')[0]} {...register('checkOutDate', { required: 'Check-out date is required' })} />
          {errors.checkOutDate && <p className="error-message">{errors.checkOutDate.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Rooms</label>
            <input type="number" min={1} max={10} className="input" {...register('numRooms', { min: 1, max: 10 })} />
          </div>
          <div>
            <label className="label">Guests</label>
            <input type="number" min={1} max={20} className="input" {...register('numGuests', { min: 1 })} />
          </div>
        </div>

        {availability && (
          <>
            <div>
              <label className="label">Your Name</label>
              <input className="input" placeholder="Full name" {...register('guestName', { required: true })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+91 9999999999" {...register('guestPhone', { required: true })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="email@example.com" {...register('guestEmail')} />
            </div>
          </>
        )}

        {/* Availability Result */}
        {availability && (
          <div className={`rounded-lg p-3 text-sm ${availability.isAvailable ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {availability.isAvailable ? (
              <>
                <p className="font-semibold">Available!</p>
                <p>{availability.nights} night(s) × {formatCurrency(availability.pricePerNight)}</p>
                <p className="font-bold text-base mt-1">Total: {formatCurrency(availability.totalPrice)}</p>
              </>
            ) : (
              <p>Not available for selected dates.</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={checking || booking}
          className="btn-primary w-full"
        >
          {checking ? 'Checking…' : booking ? 'Booking…' : availability?.isAvailable ? 'Confirm Booking' : 'Check Availability'}
        </button>

        {availability && (
          <button type="button" onClick={() => setAvailability(null)} className="w-full text-center text-sm text-gray-500 hover:text-gray-700">
            Change dates
          </button>
        )}
      </form>
    </div>
  );
}
