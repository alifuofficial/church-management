import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch groups (public)
export async function GET() {
  try {
    const groups = await db.smallGroup.findMany({
      where: { isActive: true },
      include: {
        leader: {
          select: { id: true, name: true, image: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}
