import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">🏨 Grand Horizon</h3>
          <p className="text-sm text-gray-400 leading-relaxed">A premier luxury hotel in the heart of Bangalore. Experience world-class hospitality, fine dining, and unforgettable moments.</p>
          <div className="mt-4 text-sm text-gray-400 space-y-1">
            <p>📍 42 MG Road, Bangalore</p>
            <p>📞 +91 98765 43210</p>
            <p>✉️ info@grandhorizon.com</p>
          </div>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/hotels" className="hover:text-white transition-colors">All Hotels</Link></li>
            <li><Link href="/hotel/book" className="hover:text-white transition-colors">Rooms &amp; Booking</Link></li>
            <li><Link href="/auth/register" className="hover:text-white transition-colors">Create Account</Link></li>
            <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            <li><Link href="/bookings" className="hover:text-white transition-colors">My Bookings</Link></li>
            <li><Link href="/user/profile" className="hover:text-white transition-colors">Profile</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3">Hotel Amenities</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>🏊 Rooftop Pool</li>
            <li>💆 Spa & Wellness</li>
            <li>🍽️ Fine Dining</li>
            <li>🏋️ Fitness Center</li>
            <li>💼 Business Center</li>
            <li>✈️ Airport Transfer</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Grand Horizon Hotel. All rights reserved. | Designed for exceptional hospitality.
      </div>
    </footer>
  );
}
