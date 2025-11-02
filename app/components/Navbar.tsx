'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/app/lib/api-client';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'SUPERVISOR' | 'ADMIN';
}

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check authentication status on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SC</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Sup-Connect</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              Home
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  href="/supervisors"
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  Browse Supervisors
                </Link>

                {user?.role === 'STUDENT' && (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-gray-600 hover:text-gray-900 transition"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/student/idea"
                      className="text-gray-600 hover:text-gray-900 transition"
                    >
                      Submit Idea
                    </Link>
                  </>
                )}

                {user?.role === 'SUPERVISOR' && (
                  <>
                    <Link
                      href="/supervisor/dashboard"
                      className="text-gray-600 hover:text-gray-900 transition"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/supervisor/profile"
                      className="text-gray-600 hover:text-gray-900 transition"
                    >
                      Profile
                    </Link>
                  </>
                )}

                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col space-y-1 focus:outline-none"
          >
            <span
              className={`block w-6 h-0.5 bg-gray-900 transition ${
                isOpen ? 'rotate-45 translate-y-2.5' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-gray-900 transition ${
                isOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-gray-900 transition ${
                isOpen ? '-rotate-45 -translate-y-2.5' : ''
              }`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-gray-50 border-t border-gray-200 py-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
            >
              Home
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  href="/supervisors"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
                >
                  Browse Supervisors
                </Link>

                {user?.role === 'STUDENT' && (
                  <>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/student/idea"
                      className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
                    >
                      Submit Idea
                    </Link>
                  </>
                )}

                {user?.role === 'SUPERVISOR' && (
                  <>
                    <Link
                      href="/supervisor/dashboard"
                      className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/supervisor/profile"
                      className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
                    >
                      Profile
                    </Link>
                  </>
                )}

                <div className="px-4 py-2 text-sm text-gray-600 font-medium">
                  {user?.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-blue-600 hover:bg-gray-100 rounded transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
