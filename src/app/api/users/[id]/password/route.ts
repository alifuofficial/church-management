import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Change user password
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { currentPassword, newPassword } = body;
    
    // Get current user
    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, password: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // In a real app, you would verify the current password with bcrypt
    // For demo purposes, we'll just check if it exists
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // In a real app, you would hash the password with bcrypt
    // For demo, we'll just store it (NOT SECURE - for demo only)
    await db.user.update({
      where: { id },
      data: { password: newPassword }
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
