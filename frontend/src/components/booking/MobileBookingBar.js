'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';

export default function MobileBookingBar({ minPrice, hotelName }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show bar after hero (approx 300px scroll)
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToWidget = () => {
    const el = document.getElementById('booking-widget');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 safe-area-inset-bottom">
        <div>
          <p className="text-xs text-gray-500">Starting from</p>
          <p className="font-bold text-xl text-primary-600">
            {minPrice ? formatCurrency(minPrice) : '—'}
            <span className="text-xs font-normal text-gray-400"> /night</span>
          </p>
        </div>
        <button
          onClick={scrollToWidget}
          className="btn-primary px-6 py-3 text-base font-semibold rounded-xl"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
