'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { bookingsApi, paymentsApi } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const s = document.createElement('script');
    s.id = 'razorpay-script';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function BookingDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);

  const refreshBooking = useCallback(() => {
    if (!id) return;
    bookingsApi.getById(id)
      .then((res) => setBooking(res.data.data))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/auth/login');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!id) return;
    bookingsApi.getById(id)
      .then((res) => setBooking(res.data.data))
      .catch(() => toast.error('Could not load booking'))
      .finally(() => setLoadingBooking(false));
  }, [id, refreshBooking]);

  const handlePay = async () => {
    if (!booking) return;
    setPaying(true);
    try {
      if (RAZORPAY_KEY) {
        // Real Razorpay flow
        const loaded = await loadRazorpayScript();
        if (!loaded) throw new Error('Razorpay SDK failed to load');

        const initRes = await paymentsApi.initiate({ bookingId: booking.id, method: 'RAZORPAY' });
        const { gatewayOrderId, amount, currency, paymentId } = initRes.data.data;

        await new Promise((resolve, reject) => {
          const rzp = new window.Razorpay({
            key: RAZORPAY_KEY,
            amount: Math.round(amount * 100),
            currency,
            order_id: gatewayOrderId,
            name: booking.hotel?.name || 'Hotel',
            description: `Booking ${booking.bookingNumber}`,
            handler: async (response) => {
              try {
                await paymentsApi.confirm(paymentId, {
                  gatewayPaymentId: response.razorpay_payment_id,
                  gatewaySignature: response.razorpay_signature,
                });
                toast.success('Payment successful!');
                refreshBooking();
                resolve();
              } catch (e) {
                reject(e);
              }
            },
            prefill: {
              name: booking.guestName,
              email: booking.guestEmail,
              contact: booking.guestPhone,
            },
            theme: { color: '#6366f1' },
          });
          rzp.on('payment.failed', (r) => reject(new Error(r.error.description)));
          rzp.open();
        });
      } else {
        // Demo payment flow — auto-confirms immediately
        const initRes = await paymentsApi.initiate({ bookingId: booking.id, method: 'DEMO' });
        const { paymentId } = initRes.data.data;
        await paymentsApi.confirm(paymentId, {});
        toast.success('Demo payment confirmed!');
        refreshBooking();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

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
          <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>
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

          {/* Pay Now button */}
          {booking.paymentStatus === 'PENDING' && booking.status !== 'CANCELLED' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm font-semibold text-yellow-800 mb-1">Payment Pending</p>
              <p className="text-xs text-yellow-700 mb-3">
                {RAZORPAY_KEY
                  ? 'Complete your payment securely via Razorpay.'
                  : 'Click below to confirm your demo payment.'}
              </p>
              <button
                onClick={handlePay}
                disabled={paying}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {paying ? (
                  <><span className="animate-spin h-4 w-4 rounded-full border-b-2 border-white" /> Processing…</>
                ) : (
                  <>{RAZORPAY_KEY ? '💳 Pay Now' : '✅ Confirm Payment (Demo)'}</>
                )}
              </button>
            </div>
          )}
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
