import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    const body = await request.json();
    const { name, role, image, testimony, rating, isApproved, isFeatured, order } = body;
    
    if (!name || !testimony) {
      return NextResponse.json({ error: 'Name and testimony are required' }, { status: 400 });
    }
    
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
