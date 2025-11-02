import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple JWT decode without verification for middleware (verification happens in API routes)
// This is acceptable for routing decisions; actual verification happens server-side in API routes
function decodeToken(token: string): { role?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );
    
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}
// Define route access rules
const ROUTE_RULES: {
  [key: string]: {
    requiresAuth: boolean;
    allowedRoles?: string[];
  };
} = {
  '/': { requiresAuth: false },
  '/login': { requiresAuth: false },
  '/register': { requiresAuth: false },
  '/dashboard': { requiresAuth: true, allowedRoles: ['STUDENT'] },
  '/student': { requiresAuth: true, allowedRoles: ['STUDENT'] },
  '/supervisors': { requiresAuth: true, allowedRoles: ['STUDENT'] },
  '/supervisor/dashboard': { requiresAuth: true, allowedRoles: ['SUPERVISOR'] },
  '/supervisor/profile': { requiresAuth: true, allowedRoles: ['SUPERVISOR'] },
};

function getRouteRule(pathname: string) {
  // Check for exact match first
  if (ROUTE_RULES[pathname]) {
    return ROUTE_RULES[pathname];
  }

  // Check for prefix match (e.g., /student/idea matches /student)
  for (const [route, rule] of Object.entries(ROUTE_RULES)) {
    if (pathname.startsWith(route) && route !== '/') {
      return rule;
    }
  }

  // Default: require authentication for unknown routes
  return { requiresAuth: true };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files like images, fonts, etc.
  ) {
    return NextResponse.next();
  }

  const routeRule = getRouteRule(pathname);

  // Public routes - allow access
  if (!routeRule.requiresAuth) {
    return NextResponse.next();
  }

  // Get token from cookie or Authorization header
  const token = request.cookies.get('authToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // No token - redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode token (note: we're not verifying signature here, just decoding)
  // Full verification happens in API routes with the secret
  const payload = decodeToken(token);

  if (!payload || !payload.role) {
    // Invalid token - redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('authToken');
    return response;
  }

  // Check role-based access
  if (routeRule.allowedRoles && !routeRule.allowedRoles.includes(payload.role)) {
    // User doesn't have required role - redirect to appropriate dashboard
    if (payload.role === 'STUDENT') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else if (payload.role === 'SUPERVISOR') {
      return NextResponse.redirect(new URL('/supervisor/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // User is authorized - allow access
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
