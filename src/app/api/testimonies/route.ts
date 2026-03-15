import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const testimonySchema = z.object({
  name: z.string().min(1),
  role: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  testimony: z.string().min(1),
  rating: z.number().min(1).max(5).optional(),
  isApproved: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  order: z.number().optional(),
});

// GET - Retrieve all testimonies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const approved = searchParams.get('approved');
    const featured = searchParams.get('featured');
    
    const where: Record<string, unknown> = {};
    
    if (approved === 'true') {
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
}

// POST - Create a new testimony
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const validation = testimonySchema.safeParse(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }
    const { name, role, image, testimony, rating, isApproved, isFeatured, order } = validation.data;
    
    const newTestimony = await db.testimony.create({
      data: {
        name,
        role: role || null,
        image: image || null,
        testimony,
        rating: rating || 5,
        isApproved: isApproved ?? false,
        isFeatured: isFeatured ?? false,
        order: order || 0,
      }
    });
    
    return NextResponse.json(newTestimony, { status: 201 });
  } catch (error) {
    console.error('Error creating testimony:', error);
    return NextResponse.json({ error: 'Failed to create testimony' }, { status: 500 });
  }
}

// PUT - Update a testimony
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Testimony ID is required' }, { status: 400 });
    }
    
    const updatedTestimony = await db.testimony.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json(updatedTestimony);
  } catch (error) {
    console.error('Error updating testimony:', error);
    return NextResponse.json({ error: 'Failed to update testimony' }, { status: 500 });
  }
}

// DELETE - Delete a testimony
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
}
