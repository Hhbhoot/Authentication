import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import Token from '@/models/Token';
import { getCurrentUser, clearAuthCookies } from '@/lib/auth';
import { z } from 'zod';

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = changePasswordSchema.parse(body);

    await connectDB();
    const user = await User.findById(session.userId).select('+password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. Verify old password
    const isMatch = await user.comparePassword(validatedData.oldPassword);
    if (!isMatch) {
      await AuditLog.create({
        userId: user._id,
        action: 'password_change',
        status: 'failure',
        details: { reason: 'invalid_old_password' },
      });
      return NextResponse.json({ error: 'Incorrect old password' }, { status: 400 });
    }

    // 2. Update to new password
    user.password = validatedData.newPassword;
    await user.save();

    // 3. Security: Invalidate all existing refresh tokens for this user
    await Token.deleteMany({ userId: user._id, type: 'refresh' });

    // 4. Log success
    await AuditLog.create({
      userId: user._id,
      action: 'password_change',
      status: 'success',
    });

    // 5. Clear cookies to force re-login
    await clearAuthCookies();

    return NextResponse.json({ message: 'Password changed successfully. Please log in again.' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
