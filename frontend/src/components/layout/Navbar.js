'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-primary-700 flex items-center gap-2">
          <span className="text-2xl">🏨</span>
          <span>Grand Horizon</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/hotels" className="text-gray-600 hover:text-primary-600 transition-colors">Hotels</Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors">Dashboard</Link>
              <Link href="/bookings" className="text-gray-600 hover:text-primary-600 transition-colors">My Bookings</Link>
              {user?.role === 'HOTEL_ADMIN' && (
                <Link href="/admin" className="text-gray-600 hover:text-primary-600 transition-colors">Admin</Link>
              )}
              {/* User dropdown — fixed with button toggle, no CSS gap bug */}
              <div className="relative">
                <button
                  onClick={() => setDropOpen((o) => !o)}
                  onBlur={() => setTimeout(() => setDropOpen(false), 150)}
                  className="flex items-center gap-1.5 text-gray-700 font-medium hover:text-primary-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
                >
                  <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <span>{user?.name?.split(' ')[0]}</span>
                  <span className="text-gray-400 text-xs">{dropOpen ? '▲' : '▾'}</span>
                </button>
                {dropOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <Link href="/user/profile" onClick={() => setDropOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      👤 Profile
                    </Link>
                    <Link href="/bookings" onClick={() => setDropOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      📋 My Bookings
                    </Link>
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={() => { setDropOpen(false); logout(); }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        🚪 Sign out
                      </button>
                    </div>
                  </div>
                )}
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
        <button
          className="md:hidden text-gray-500 hover:text-gray-700 p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="text-xl">{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1 text-sm shadow-lg">
          <Link href="/hotels" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-gray-700 rounded-lg hover:bg-gray-50">🏨 Hotels</Link>
          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 bg-gray-50 rounded-lg mb-2">
                <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-gray-700 rounded-lg hover:bg-gray-50">📊 Dashboard</Link>
              <Link href="/bookings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-gray-700 rounded-lg hover:bg-gray-50">📋 My Bookings</Link>
              <Link href="/user/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-gray-700 rounded-lg hover:bg-gray-50">👤 Profile</Link>
              {user?.role === 'HOTEL_ADMIN' && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-gray-700 rounded-lg hover:bg-gray-50">⚙️ Admin Panel</Link>
              )}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-red-600 rounded-lg hover:bg-red-50 text-left"
                >
                  🚪 Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-gray-700 rounded-lg hover:bg-gray-50">Sign in</Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 bg-primary-600 text-white rounded-lg text-center font-medium">Get started →</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

