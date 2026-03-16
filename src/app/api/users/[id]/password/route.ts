import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { compare, hash } from 'bcryptjs';

// PUT - Change user password
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { currentPassword, newPassword } = body;
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
    }

    // Get current user
    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, password: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Explicitly check for password existence (should always be there for non-SSO users)
    if (!user.password) {
      return NextResponse.json({ error: 'Unable to change password for this account type' }, { status: 400 });
    }

    // Verify current password
    const isCorrectPassword = await compare(currentPassword, user.password);
    if (!isCorrectPassword) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    // Hash the new password
    const hashedNewPassword = await hash(newPassword, 12);

    // Update password
    await db.user.update({
      where: { id },
      data: { password: hashedNewPassword }
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
