'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authAPI } from '@/app/lib/api-client';
import NotificationBell from './NotificationBell';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'SUPERVISOR' | 'ADMIN' | 'SUPER_ADMIN';
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsLoggedIn(true);
      // Fetch profile picture from API
      fetchProfilePicture(token);
    }
  }, []);

  const fetchProfilePicture = async (token: string) => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.profile?.profile_picture) {
          setProfilePicture(`data:image/jpeg;base64,${data.profile.profile_picture}`);
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile picture:', err);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const getDropdownLinks = () => {
    if (user?.role === 'STUDENT') {
      return [
        { href: '/student/dashboard', label: 'Dashboard' },
        { href: '/supervisors', label: 'Browse Supervisors' },
        { href: '/student/recommendations', label: 'My Recommendations' },
        { href: '/student/idea', label: 'My Project Idea' },
        { href: '/student/appointments', label: 'My Appointments' },
        { href: '/messages', label: 'Messages' },
        { href: '/profile', label: 'My Profile' },
      ];
    } else if (user?.role === 'SUPERVISOR') {
      return [
        { href: '/supervisor/dashboard', label: 'Dashboard' },
        { href: '/supervisor/availability', label: 'Manage Availability' },
        { href: '/messages', label: 'Messages' },
        { href: '/profile', label: 'My Profile' },
      ];
    } else if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      return [
        { href: '/admin/dashboard', label: 'Dashboard' },
        { href: '/admin/users', label: 'User Management' },
        { href: '/profile', label: 'My Profile' },
      ];
    }
    return [];
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Sup-Connect</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Home
            </Link>

            {isHome && (
              <>
                <Link href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Features
                </Link>
                <Link href="#cta" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Get Started
                </Link>
              </>
            )}

            {!isLoggedIn ? (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <NotificationBell />
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="transition-transform hover:scale-110"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt={user?.name || 'Profile'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info Header */}
                      <div className="px-4 py-4 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md overflow-hidden">
                            {profilePicture ? (
                              <img
                                src={profilePicture}
                                alt={user?.name || 'Profile'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{initials}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm truncate">{user?.name}</p>
                            <p className="text-blue-100 text-xs truncate">{user?.email}</p>
                            <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs font-bold bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/30">
                              {user?.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                      {/* Menu Items */}
                      <nav className="py-2 px-1 space-y-0.5">
                        {getDropdownLinks().map((link) => {
                          const getIcon = (href: string) => {
                            if (href.includes('dashboard')) return 'fa-gauge';
                            if (href.includes('supervisors')) return 'fa-users';
                            if (href.includes('recommendations')) return 'fa-star';
                            if (href.includes('idea')) return 'fa-lightbulb';
                            if (href.includes('management')) return 'fa-sliders';
                            return 'fa-user';
                          };
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setIsDropdownOpen(false)}
                              className="px-3 py-2 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm group"
                            >
                              <div className="w-7 h-7 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                                <i className={`fas ${getIcon(link.href)} text-blue-600 text-sm`}></i>
                              </div>
                              <span>{link.label}</span>
                            </Link>
                          );
                        })}
                      </nav>

                      {/* Logout */}
                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent rounded-lg transition-all duration-200 font-medium flex items-center gap-2 text-sm group mx-1"
                        >
                          <div className="w-7 h-7 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors">
                            <i className="fas fa-sign-out-alt text-red-600 text-sm"></i>
                          </div>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg font-medium transition-colors">
              Home
            </Link>

            {isHome && (
              <>
                <Link href="#features" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                  Features
                </Link>
                <Link href="#cta" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                  Get Started
                </Link>
              </>
            )}

            {!isLoggedIn ? (
              <>
                <Link href="/login" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                  Login
                </Link>
                <Link href="/register" className="block px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium transition-colors">
                  Sign Up
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="block px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium w-full text-left transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
