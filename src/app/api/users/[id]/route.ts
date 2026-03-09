import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import { withAuth, withAdmin, canModifyResource, AuthContext } from '@/lib/api-auth';
import { sanitizeInput, isValidPassword } from '@/lib/auth-utils';

// GET - Get single user (requires authentication)
export const GET = withAuth(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const { id } = await context.params;
    
    // Users can only view their own profile unless they're admin
    const isAdminUser = auth.user.role === 'ADMIN' || auth.user.role === 'SUPER_ADMIN';
    const canView = auth.user.id === id || isAdminUser;
    
    if (!canView) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        bio: true,
        memberSince: true,
        isVerified: true,
        isActive: true,
        emailOptIn: true,
        smsOptIn: true,
        createdAt: true,
        _count: {
          select: {
            registrations: true,
            donations: true,
            prayerRequests: true,
            smallGroupMembers: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
});

// PUT - Update user (requires authentication, owner or admin)
export const PUT = withAuth(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    // Check permissions
    const canEdit = canModifyResource(auth, id);
    if (!canEdit) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    const updateData: Record<string, unknown> = {};
    
    // Basic fields anyone can edit on their own profile
    if (body.name !== undefined) updateData.name = sanitizeInput(body.name);
    if (body.phone !== undefined) updateData.phone = body.phone ? sanitizeInput(body.phone) : null;
    if (body.address !== undefined) updateData.address = body.address ? sanitizeInput(body.address) : null;
    if (body.city !== undefined) updateData.city = body.city ? sanitizeInput(body.city) : null;
    if (body.state !== undefined) updateData.state = body.state ? sanitizeInput(body.state) : null;
    if (body.zipCode !== undefined) updateData.zipCode = body.zipCode ? sanitizeInput(body.zipCode) : null;
    if (body.bio !== undefined) updateData.bio = body.bio ? sanitizeInput(body.bio) : null;
    if (body.emailOptIn !== undefined) updateData.emailOptIn = Boolean(body.emailOptIn);
    if (body.smsOptIn !== undefined) updateData.smsOptIn = Boolean(body.smsOptIn);
    if (body.image !== undefined) updateData.image = body.image;
    
    // Password change (any user can change their own password)
    if (body.password) {
      const passwordCheck = isValidPassword(body.password);
      if (!passwordCheck.valid) {
        return NextResponse.json(
          { error: passwordCheck.message },
          { status: 400 }
        );
      }
      updateData.password = await hash(body.password, 12);
    }
    
    // Admin-only fields
    const isAdminUser = auth.user.role === 'ADMIN' || auth.user.role === 'SUPER_ADMIN';
    if (isAdminUser) {
      if (body.email !== undefined) updateData.email = sanitizeInput(body.email.toLowerCase());
      if (body.role !== undefined) updateData.role = body.role;
      if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
      if (body.isVerified !== undefined) updateData.isVerified = Boolean(body.isVerified);
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        bio: true,
        memberSince: true,
        isVerified: true,
        isActive: true,
        emailOptIn: true,
        smsOptIn: true,
        createdAt: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
});

// DELETE - Delete user (admin only)
export const DELETE = withAdmin(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const { id } = await context.params;
    
    // Prevent self-deletion
    if (auth.user.id === id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    // First delete related records
    await db.$transaction([
      db.notification.deleteMany({ where: { userId: id } }),
      db.sermonBookmark.deleteMany({ where: { userId: id } }),
      db.sermonNote.deleteMany({ where: { userId: id } }),
      db.smallGroupMember.deleteMany({ where: { userId: id } }),
      db.prayerResponse.deleteMany({ where: { prayerRequest: { userId: id } } }),
      db.prayerRequest.deleteMany({ where: { userId: id } }),
      db.registration.deleteMany({ where: { userId: id } }),
      db.donation.updateMany({ 
        where: { userId: id }, 
        data: { userId: null } 
      }),
      db.user.delete({ where: { id } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
});
