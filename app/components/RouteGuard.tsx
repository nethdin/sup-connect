'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getClientUser, isAuthenticated } from '@/app/lib/auth';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('STUDENT' | 'SUPERVISOR' | 'ADMIN')[];
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

    // If specific roles are required, check user role
    if (allowedRoles && allowedRoles.length > 0) {
      const user = getClientUser();
      
      if (!user || !allowedRoles.includes(user.role)) {
        // Redirect based on user role
        if (user?.role === 'STUDENT') {
          router.push('/dashboard');
        } else if (user?.role === 'SUPERVISOR') {
          router.push('/supervisor/dashboard');
        } else {
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
