import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const registration = await db.registration.findUnique({
      where: { id },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          }
        }
      }
    });

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Error fetching registration:', error);
    return NextResponse.json({ error: 'Failed to fetch registration' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updateData: Record<string, unknown> = {};
    
    if (body.status) {
      updateData.status = body.status;
      
      // Set timestamps based on status
      if (body.status === 'CONFIRMED') {
        updateData.confirmedAt = new Date();
      } else if (body.status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
      } else if (body.status === 'ATTENDED') {
        updateData.attendedAt = new Date();
      }
    }
    
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    const registration = await db.registration.update({
      where: { id },
      data: updateData,
      include: {
        event: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          }
        }
      }
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const registration = await db.registration.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date()
      }
    });

    // Update event registration count
    await db.event.update({
      where: { id: registration.eventId },
      data: { registrationCount: { decrement: 1 } }
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Error cancelling registration:', error);
    return NextResponse.json({ error: 'Failed to cancel registration' }, { status: 500 });
  }
}
