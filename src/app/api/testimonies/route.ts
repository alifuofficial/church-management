import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withAuth, withAdmin, withOptionalAuth, AuthContext } from '@/lib/api-auth';
import { sanitizeInput } from '@/lib/auth-utils';

// GET - Retrieve testimonies (public for approved, admin sees all)
export const GET = withOptionalAuth(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext | null
) => {
  try {
    const { searchParams } = new URL(request.url);
    const approved = searchParams.get('approved');
    const featured = searchParams.get('featured');
    
    const where: Record<string, unknown> = {};
    
    // Non-admins only see approved testimonies
    const isAdminUser = auth && (auth.user.role === 'ADMIN' || auth.user.role === 'SUPER_ADMIN');
    
    if (approved === 'true' || !isAdminUser) {
      where.isApproved = true;
    }
    
    if (featured === 'true') {
      where.isFeatured = true;
    }
    
    const testimonies = await db.testimony.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    
    return NextResponse.json(testimonies);
  } catch (error) {
    console.error('Error fetching testimonies:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonies' }, { status: 500 });
  }
});

// POST - Create a new testimony (admin only)
export const POST = withAuth(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const body = await request.json();
    const { name, role, image, testimony, rating, isApproved, isFeatured, order } = body;
    
    if (!name || !testimony) {
      return NextResponse.json({ error: 'Name and testimony are required' }, { status: 400 });
    }
    
    // Admins can approve directly, members create pending testimonies
    const isAdminUser = auth.user.role === 'ADMIN' || auth.user.role === 'SUPER_ADMIN';
    
    const newTestimony = await db.testimony.create({
      data: {
        name: sanitizeInput(name),
        role: role ? sanitizeInput(role) : null,
        image: image || null,
        testimony: sanitizeInput(testimony),
        rating: rating || 5,
        isApproved: isAdminUser ? (isApproved ?? true) : false,
        isFeatured: isAdminUser ? (isFeatured ?? false) : false,
        order: order || 0,
      }
    });
    
    return NextResponse.json(newTestimony, { status: 201 });
  } catch (error) {
    console.error('Error creating testimony:', error);
    return NextResponse.json({ error: 'Failed to create testimony' }, { status: 500 });
  }
});

// PUT - Update a testimony (admin only)
export const PUT = withAdmin(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Testimony ID is required' }, { status: 400 });
    }
    
    // Sanitize text fields
    const sanitizedData: Record<string, unknown> = {};
    if (data.name !== undefined) sanitizedData.name = sanitizeInput(data.name);
    if (data.role !== undefined) sanitizedData.role = data.role ? sanitizeInput(data.role) : null;
    if (data.testimony !== undefined) sanitizedData.testimony = sanitizeInput(data.testimony);
    if (data.image !== undefined) sanitizedData.image = data.image;
    if (data.rating !== undefined) sanitizedData.rating = data.rating;
    if (data.isApproved !== undefined) sanitizedData.isApproved = data.isApproved;
    if (data.isFeatured !== undefined) sanitizedData.isFeatured = data.isFeatured;
    if (data.order !== undefined) sanitizedData.order = data.order;
    sanitizedData.updatedAt = new Date();
    
    const updatedTestimony = await db.testimony.update({
      where: { id },
      data: sanitizedData
    });
    
    return NextResponse.json(updatedTestimony);
  } catch (error) {
    console.error('Error updating testimony:', error);
    return NextResponse.json({ error: 'Failed to update testimony' }, { status: 500 });
  }
});

// DELETE - Delete a testimony (admin only)
export const DELETE = withAdmin(async (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  auth: AuthContext
) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Testimony ID is required' }, { status: 400 });
    }
    
    await db.testimony.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true, message: 'Testimony deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimony:', error);
    return NextResponse.json({ error: 'Failed to delete testimony' }, { status: 500 });
  }
});
