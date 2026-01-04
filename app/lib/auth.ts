// Authentication utilities
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/app/lib/config';

const JWT_SECRET = authConfig.jwtSecret;

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'SUPERVISOR' | 'ADMIN';
}

/**
 * Verify JWT token and extract payload
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Middleware to protect API routes
 * @param request - Next.js request object
 * @param allowedRoles - Array of roles allowed to access this route
 * @returns User payload if authorized, or error response
 */
export function authenticateRequest(
  request: NextRequest,
  allowedRoles?: ('STUDENT' | 'SUPERVISOR' | 'ADMIN')[]
): { user: JWTPayload } | { error: NextResponse } {
  const token = extractToken(request);

  if (!token) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      ),
    };
  }

  const user = verifyToken(token);

  if (!user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      ),
    };
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      error: NextResponse.json(
        { error: `Forbidden - ${user.role} role not allowed` },
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Get user from localStorage (client-side only)
 */
export function getClientUser(): {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'SUPERVISOR' | 'ADMIN' | 'SUPER_ADMIN';
} | null {
  if (typeof window === 'undefined') return null;

  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    return null;
  }
}

/**
 * Check if user is authenticated (client-side)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('authToken');
  return !!token;
}
