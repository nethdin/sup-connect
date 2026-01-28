'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getClientUser, isAuthenticated } from '@/app/lib/auth';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('STUDENT' | 'SUPERVISOR' | 'ADMIN' | 'SUPER_ADMIN')[];
  redirectTo?: string;
}

/**
 * Client-side route protection component
 * Wraps pages that require authentication
 */
export default function RouteGuard({
  children,
  allowedRoles,
  redirectTo = '/login',
}: RouteGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = () => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push(redirectTo);
      return;
    }

    // Ensure cookie is synced with localStorage for server-side middleware
    const token = localStorage.getItem('authToken');
    if (token && typeof document !== 'undefined') {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      // If cookie doesn't exist or doesn't match, set it
      if (!cookieValue || cookieValue !== token) {
        document.cookie = `authToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
      }
    }

    // If specific roles are required, check user role
    if (allowedRoles && allowedRoles.length > 0) {
      const user = getClientUser();

      if (!user || !allowedRoles.includes(user.role as any)) {
        // Redirect based on user role
        switch (user?.role) {
          case 'STUDENT':
            router.push('/student/dashboard');
            break;
          case 'SUPERVISOR':
            router.push('/supervisor/dashboard');
            break;
          case 'ADMIN':
          case 'SUPER_ADMIN':
            router.push('/admin/dashboard');
            break;
          default:
            router.push('/');
        }
        return;
      }
    }

    // User is authorized
    setIsAuthorized(true);
    setIsChecking(false);
  };

  // Show loading state while checking authorization
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Only render children if authorized
  return isAuthorized ? <>{children}</> : null;
}
