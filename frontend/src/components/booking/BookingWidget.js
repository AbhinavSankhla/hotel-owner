'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { bookingsApi, roomsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

// ── Daily booking form ──────────────────────────────────────────────────────
function DailyBookingForm({ hotel, selectedRT, selectedRoomType }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [booking, setBooking] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { checkInDate: today, checkOutDate: tomorrow, numRooms: 1, numGuests: 1 },
  });
  const numRooms = parseInt(watch('numRooms') || 1);
  const maxGuests = selectedRT?.maxGuests ? selectedRT.maxGuests * numRooms : 20;

  const checkAvailability = async (data) => {
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
    if (!isAuthenticated) { toast.error('Please sign in to book'); router.push('/auth/login'); return; }
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
      toast.success('Booking created!');
      router.push(`/bookings/${res.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(availability ? onBook : checkAvailability)} className="space-y-4">
      <div>
        <label className="label">Check-in Date</label>
        <input type="date" className="input" min={today} {...register('checkInDate', { required: true })} />
      </div>
      <div>
        <label className="label">Check-out Date</label>
        <input type="date" className="input" min={today} {...register('checkOutDate', { required: true })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Rooms</label>
          <input type="number" min={1} max={availability?.availableRooms ?? selectedRT?.totalRooms ?? 10} className="input"
            {...register('numRooms', { min: 1, max: availability?.availableRooms ?? selectedRT?.totalRooms ?? 10 })} />
        </div>
        <div>
          <label className="label">Guests <span className="text-gray-400 text-xs">(max {maxGuests})</span></label>
          <input type="number" min={1} max={maxGuests} className="input"
            {...register('numGuests', { min: 1, max: maxGuests, required: 'Required' })} />
          {errors.numGuests && <p className="text-red-500 text-xs mt-1">Max {maxGuests} guests allowed</p>}
        </div>
      </div>

      {availability && (
        <>
          <div><label className="label">Your Name</label><input className="input" placeholder="Full name" {...register('guestName', { required: true })} /></div>
          <div><label className="label">Phone</label><input className="input" placeholder="+919999999999" {...register('guestPhone', { required: true })} /></div>
          <div><label className="label">Email</label><input type="email" className="input" placeholder="email@example.com" {...register('guestEmail')} /></div>
        </>
      )}

      {availability && (
        <div className={`rounded-xl p-4 text-sm ${availability.isAvailable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {availability.isAvailable ? (
            <div className="text-green-800">
              <p className="font-semibold text-green-900 mb-2">✓ Available</p>
              <div className="space-y-1">
                <div className="flex justify-between"><span>{availability.nights} night{availability.nights > 1 ? 's' : ''} × {formatCurrency(availability.pricePerNight)}</span><span>{formatCurrency(availability.subtotal ?? availability.totalPrice)}</span></div>
                {availability.taxAmount > 0 && <div className="flex justify-between text-green-700"><span>GST ({Math.round((availability.taxRate ?? 0.12) * 100)}%)</span><span>+{formatCurrency(availability.taxAmount)}</span></div>}
                <div className="flex justify-between font-bold text-green-900 pt-1 border-t border-green-200 mt-1"><span>Total</span><span>{formatCurrency(availability.totalPrice)}</span></div>
              </div>
            </div>
          ) : (
            <p className="text-red-700">❌ Not available for selected dates.</p>
          )}
        </div>
      )}

      <button type="submit" disabled={checking || booking} className="btn-primary w-full">
        {checking ? 'Checking…' : booking ? 'Booking…' : availability?.isAvailable ? 'Confirm Booking' : 'Check Availability'}
      </button>
      {availability && <button type="button" onClick={() => setAvailability(null)} className="w-full text-center text-sm text-gray-500 hover:text-gray-700">Change dates</button>}
    </form>
  );
}

// ── Hourly booking form ─────────────────────────────────────────────────────
function HourlyBookingForm({ hotel, selectedRT, selectedRoomType }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [slots, setSlots] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [numHours, setNumHours] = useState(1);
  const [checking, setChecking] = useState(false);
  const [booking, setBooking] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ name: '', phone: '', email: '' });

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  const checkSlots = async () => {
    if (!date) return;
    setChecking(true);
    setSlots(null);
    setSelectedSlot(null);
    try {
      const res = await roomsApi.checkHourlyAvailability({ roomTypeId: selectedRoomType, date });
      setSlots(res.data.data?.availableSlots || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch slots');
    } finally { setChecking(false); }
  };

  const onBook = async () => {
    if (!isAuthenticated) { toast.error('Please sign in to book'); router.push('/auth/login'); return; }
    if (!selectedSlot) { toast.error('Please select a time slot'); return; }
    if (!guestInfo.name || !guestInfo.phone) { toast.error('Name and phone are required'); return; }
    setBooking(true);
    try {
      const res = await bookingsApi.createHourly({
        hotelId: hotel.id,
        roomTypeId: selectedRoomType,
        date,
        slotStart: selectedSlot.slotStart,
        numHours,
        numRooms: 1,
        numGuests: 1,
        guestName: guestInfo.name,
        guestPhone: guestInfo.phone,
        guestEmail: guestInfo.email,
      });
      toast.success('Booking created!');
      router.push(`/bookings/${res.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setBooking(false); }
  };

  const pricePerHour = selectedRT?.basePriceHourly || 0;
  const total = pricePerHour * numHours;

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Date</label>
        <input type="date" className="input" min={today} value={date} onChange={(e) => { setDate(e.target.value); setSlots(null); setSelectedSlot(null); }} />
      </div>
      <button type="button" onClick={checkSlots} disabled={checking} className="btn-primary w-full">
        {checking ? 'Loading slots…' : 'Show Available Slots'}
      </button>

      {slots !== null && slots.length === 0 && (
        <p className="text-center text-red-600 text-sm">No slots available for this date.</p>
      )}

      {slots && slots.length > 0 && (
        <>
          <div>
            <label className="label">Select Time Slot</label>
            <div className="grid grid-cols-2 gap-2">
              {slots.map((s) => (
                <button key={s.slotStart} type="button"
                  onClick={() => setSelectedSlot(s)}
                  className={`text-sm py-2 px-3 rounded-lg border transition-all ${selectedSlot?.slotStart === s.slotStart ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold' : 'border-gray-200 hover:border-gray-400'}`}
                >
                  {s.slotStart} – {s.slotEnd}
                </button>
              ))}
            </div>
          </div>

          {selectedSlot && (
            <>
              <div>
                <label className="label">Duration (hours)</label>
                <input type="number" min={1} max={selectedRT?.maxHours || 12} className="input"
                  value={numHours} onChange={(e) => setNumHours(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                <div className="flex justify-between"><span>{numHours}h × {formatCurrency(pricePerHour)}/hr</span><span className="font-bold">{formatCurrency(total)}</span></div>
              </div>
              <div><label className="label">Name</label><input className="input" placeholder="Full name" value={guestInfo.name} onChange={(e) => setGuestInfo((p) => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="label">Phone</label><input className="input" placeholder="+919999999999" value={guestInfo.phone} onChange={(e) => setGuestInfo((p) => ({ ...p, phone: e.target.value }))} /></div>
              <div><label className="label">Email</label><input type="email" className="input" placeholder="email@example.com" value={guestInfo.email} onChange={(e) => setGuestInfo((p) => ({ ...p, email: e.target.value }))} /></div>
              <button type="button" onClick={onBook} disabled={booking} className="btn-primary w-full">
                {booking ? 'Booking…' : 'Confirm Hourly Booking'}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ── Main Widget ─────────────────────────────────────────────────────────────
export default function BookingWidget({ hotel, roomTypes }) {
  const [selectedRoomType, setSelectedRoomType] = useState(roomTypes[0]?.id || '');
  const [bookTab, setBookTab] = useState('daily');

  const selectedRT = roomTypes.find((rt) => String(rt.id) === String(selectedRoomType));
  const bookingModel = selectedRT?.bookingModelOverride || hotel?.bookingModel || 'DAILY';
  const showDaily = bookingModel === 'DAILY' || bookingModel === 'BOTH';
  const showHourly = bookingModel === 'HOURLY' || bookingModel === 'BOTH';

  // Default tab based on model
  const effectiveTab = bookingModel === 'HOURLY' ? 'hourly' : bookTab;

  return (
    <div className="card p-6 sticky top-4">
      <h3 className="text-lg font-semibold mb-4">Book Your Stay</h3>

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

      {/* Tab selector — only if both types are available */}
      {bookingModel === 'BOTH' && (
        <div className="flex rounded-lg bg-gray-100 p-1 mb-4">
          <button type="button" onClick={() => setBookTab('daily')}
            className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-colors ${effectiveTab === 'daily' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            🗓️ Daily
          </button>
          <button type="button" onClick={() => setBookTab('hourly')}
            className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-colors ${effectiveTab === 'hourly' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            ⏰ Hourly
          </button>
        </div>
      )}

      {effectiveTab === 'daily' && showDaily && (
        <DailyBookingForm hotel={hotel} selectedRT={selectedRT} selectedRoomType={selectedRoomType} />
      )}
      {effectiveTab === 'hourly' && showHourly && (
        <HourlyBookingForm hotel={hotel} selectedRT={selectedRT} selectedRoomType={selectedRoomType} />
      )}
    </div>
  );
}
