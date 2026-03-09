import { NextRequest, NextResponse } from 'next/server';
import { validateSession, Session } from '@/lib/session';

// API Route handler type
type RouteHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

// Authenticated route context
export interface AuthContext {
  session: Session;
  user: Session['user'];
}

// Authenticated route handler type
export type AuthRouteHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => Promise<NextResponse>;

/**
 * Wraps an API route with authentication
 * Usage: export const GET = withAuth(async (request, context, auth) => { ... })
 */
export function withAuth(handler: AuthRouteHandler): RouteHandler {
  return async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    // Get session token from cookie or Authorization header
    const token = 
      request.cookies.get('sessionToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const session = await validateSession(token);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 401 }
      );
    }
    
    // Call the handler with auth context
    return handler(request, context, { session, user: session.user });
  };
}

/**
 * Wraps an API route with role-based authorization
 * Usage: export const GET = withRoles(['ADMIN', 'PASTOR'])(async (request, context, auth) => { ... })
 */
export function withRoles(roles: string[]) {
  return function(handler: AuthRouteHandler): RouteHandler {
    return withAuth(async (request, context, auth) => {
      const userRole = auth.user.role;
      const hasRequiredRole = roles.some(role => {
        const roleHierarchy: Record<string, number> = {
          VISITOR: 0,
          MEMBER: 1,
          PASTOR: 2,
          ADMIN: 3,
          SUPER_ADMIN: 4,
        };
        const userLevel = roleHierarchy[userRole] ?? 0;
        const requiredLevel = roleHierarchy[role] ?? 0;
        return userLevel >= requiredLevel;
      });
      
      if (!hasRequiredRole) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      return handler(request, context, auth);
    });
  };
}

/**
 * Wraps an API route requiring admin role
 * Usage: export const DELETE = withAdmin(async (request, context, auth) => { ... })
 */
export function withAdmin(handler: AuthRouteHandler): RouteHandler {
  return withRoles(['ADMIN', 'SUPER_ADMIN'])(handler);
}

/**
 * Optional authentication - passes auth if present but doesn't require it
 * Usage: export const GET = withOptionalAuth(async (request, context, auth) => { ... })
 */
export function withOptionalAuth(
  handler: (request: NextRequest, context: { params: Promise<Record<string, string>> }, auth: AuthContext | null) => Promise<NextResponse>
): RouteHandler {
  return async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const token = 
      request.cookies.get('sessionToken')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    
    let auth: AuthContext | null = null;
    
    if (token) {
      const session = await validateSession(token);
      if (session) {
        auth = { session, user: session.user };
      }
    }
    
    return handler(request, context, auth);
  };
}

/**
 * Check if user owns a resource or is admin
 */
export function canModifyResource(auth: AuthContext, resourceUserId: string): boolean {
  return auth.user.id === resourceUserId || 
         auth.user.role === 'ADMIN' || 
         auth.user.role === 'SUPER_ADMIN';
}
