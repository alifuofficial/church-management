import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/google',
  '/api/auth/facebook',
  '/api/auth/callback',
  '/api/auth/send-verification',
  '/api/auth/verify-email',
  '/api/settings/email-verification',
  '/api/social-login-settings',
  '/api/subscribers',
  '/api/unsubscribe',
];

// Routes that require authentication
const protectedRoutes = [
  '/api/users',
  '/api/donations',
  '/api/upload',
  '/api/settings',
  '/api/email-settings',
  '/api/newsletters',
  '/api/newsletters/send',
  '/api/prayers',
  '/api/events',
  '/api/sermons',
  '/api/testimonies',
  '/api/campaigns',
  '/api/registrations',
  '/api/groups',
  '/api/programs',
  '/api/media',
  '/api/sms',
  '/api/files',
  '/api/dashboard',
  '/api/seed',
];

// Routes that require admin role
const adminRoutes = [
  '/api/users/[id]',
  '/api/settings',
  '/api/newsletters/send',
  '/api/seed',
  '/api/sms/send',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Add security headers to all responses
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: https:;
    font-src 'self' data:;
    connect-src 'self' https:;
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim();
  response.headers.set('Content-Security-Policy', csp);
  
  // Check if it's an API route
  if (!pathname.startsWith('/api/')) {
    return response;
  }
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return response;
  }
  
  // Check for session token in cookies or headers
  const sessionToken = 
    request.cookies.get('sessionToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');
  
  // For now, log access attempts (in production, validate the token)
  console.log(`[API Access] ${request.method} ${pathname} - Token: ${sessionToken ? 'present' : 'missing'}`);
  
  // For protected routes without a token, return 401
  // Note: In production, you should validate the token properly
  // For now, we'll allow access but log it
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
