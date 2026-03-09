import { db } from '@/lib/db';
import { randomBytes, createHash } from 'crypto';

// Session configuration
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const TOKEN_LENGTH = 32;

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  image: string | null;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  user: SessionUser;
}

// In-memory session store (use Redis in production)
const sessions = new Map<string, Session>();

// Generate a secure random token
export function generateToken(): string {
  return randomBytes(TOKEN_LENGTH).toString('hex');
}

// Hash a token for storage
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// Create a new session
export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  
  // Get user data
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
      isActive: true,
    },
  });
  
  if (!user || !user.isActive) {
    throw new Error('User not found or inactive');
  }
  
  // Create session object
  const session: Session = {
    id: tokenHash,
    userId: user.id,
    token: token,
    expiresAt,
    createdAt: new Date(),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
    },
  };
  
  // Store session
  sessions.set(tokenHash, session);
  
  // Also store in database for persistence (optional, can be removed if using Redis)
  try {
    await db.setting.upsert({
      where: { key: `session_${tokenHash}` },
      update: { 
        value: JSON.stringify({
          userId: user.id,
          expiresAt: expiresAt.toISOString(),
          createdAt: new Date().toISOString(),
        }),
      },
      create: {
        key: `session_${tokenHash}`,
        value: JSON.stringify({
          userId: user.id,
          expiresAt: expiresAt.toISOString(),
          createdAt: new Date().toISOString(),
        }),
      },
    });
  } catch (error) {
    console.error('Error storing session in database:', error);
  }
  
  return { token, expiresAt };
}

// Validate a session token
export async function validateSession(token: string): Promise<Session | null> {
  if (!token) return null;
  
  const tokenHash = hashToken(token);
  
  // Check in-memory store first
  let session = sessions.get(tokenHash);
  
  // If not in memory, try to load from database
  if (!session) {
    try {
      const storedSession = await db.setting.findUnique({
        where: { key: `session_${tokenHash}` },
      });
      
      if (storedSession) {
        const data = JSON.parse(storedSession.value);
        const user = await db.user.findUnique({
          where: { id: data.userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            image: true,
            isActive: true,
          },
        });
        
        if (user && user.isActive) {
          session = {
            id: tokenHash,
            userId: user.id,
            token,
            expiresAt: new Date(data.expiresAt),
            createdAt: new Date(data.createdAt),
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              image: user.image,
            },
          };
          sessions.set(tokenHash, session);
        }
      }
    } catch (error) {
      console.error('Error loading session from database:', error);
    }
  }
  
  if (!session) return null;
  
  // Check if session is expired
  if (new Date() > session.expiresAt) {
    await deleteSession(token);
    return null;
  }
  
  return session;
}

// Delete a session
export async function deleteSession(token: string): Promise<void> {
  if (!token) return;
  
  const tokenHash = hashToken(token);
  sessions.delete(tokenHash);
  
  try {
    await db.setting.delete({
      where: { key: `session_${tokenHash}` },
    }).catch(() => {});
  } catch (error) {
    // Ignore errors when deleting non-existent sessions
  }
}

// Clean up expired sessions
export async function cleanupSessions(): Promise<void> {
  const now = new Date();
  
  for (const [key, session] of sessions) {
    if (now > session.expiresAt) {
      sessions.delete(key);
    }
  }
  
  // Also clean up database sessions
  try {
    const allSessions = await db.setting.findMany({
      where: { key: { startsWith: 'session_' } },
    });
    
    for (const storedSession of allSessions) {
      try {
        const data = JSON.parse(storedSession.value);
        if (new Date(data.expiresAt) < now) {
          await db.setting.delete({
            where: { key: storedSession.key },
          });
        }
      } catch {
        // Invalid session data, delete it
        await db.setting.delete({
          where: { key: storedSession.key },
        });
      }
    }
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
  }
}

// Role hierarchy for authorization
const ROLE_HIERARCHY: Record<string, number> = {
  VISITOR: 0,
  MEMBER: 1,
  PASTOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

// Check if user has required role
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  const minRequiredLevel = Math.min(
    ...requiredRoles.map(r => ROLE_HIERARCHY[r] ?? 0)
  );
  return userLevel >= minRequiredLevel;
}

// Check if user is admin
export function isAdmin(role: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}
