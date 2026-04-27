'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-primary-700 flex items-center gap-2">
          <span className="text-2xl">🏨</span>
          <span>Grand Horizon</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/hotels" className="text-gray-600 hover:text-gray-900">Hotels</Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link href="/bookings" className="text-gray-600 hover:text-gray-900">Bookings</Link>
              {user?.role === 'HOTEL_ADMIN' && <Link href="/admin" className="text-gray-600 hover:text-gray-900">Admin</Link>}
              <div className="relative group">
                <button className="flex items-center gap-1.5 text-gray-700 font-medium">
                  {user?.name?.split(' ')[0]}
                  <span className="text-gray-400">▾</span>
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                  <Link href="/user/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign out</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Sign in</Link>
              <Link href="/auth/register" className="btn-primary text-sm py-1.5 px-4">Get started</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-2 text-sm">
          <Link href="/hotels" className="block py-2 text-gray-600">Hotels</Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="block py-2 text-gray-600">Dashboard</Link>
              <Link href="/bookings" className="block py-2 text-gray-600">Bookings</Link>
              <Link href="/user/profile" className="block py-2 text-gray-600">Profile</Link>
              {user?.role === 'HOTEL_ADMIN' && <Link href="/admin" className="block py-2 text-gray-600">Admin</Link>}
              <button onClick={logout} className="block py-2 text-red-600 w-full text-left">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block py-2 text-gray-600">Sign in</Link>
              <Link href="/auth/register" className="block py-2 text-primary-600 font-medium">Get started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
