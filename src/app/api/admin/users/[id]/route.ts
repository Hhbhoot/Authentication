import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Token from '@/models/Token';
import Role from '@/models/Role';
import AuditLog from '@/models/AuditLog';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const updateSchema = z.object({
  isBlocked: z.boolean().optional(),
  roleName: z.enum(['admin', 'user']).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const adminSession = await getCurrentUser();

    // Secondary check (defense in depth)
    if (!adminSession || adminSession.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateSchema.parse(body);

    await connectDB();
    const user = await User.findById(targetUserId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. Handle Role Change
    if (validatedData.roleName) {
      const role = await Role.findOne({ name: validatedData.roleName });
      if (role) {
        user.role = role._id;
        await AuditLog.create({
          userId: adminSession.userId,
          action: 'role_changed',
          status: 'success',
          details: { targetUserId, newRole: validatedData.roleName },
        });
      }
    }

    // 2. Handle Block/Unblock
    if (typeof validatedData.isBlocked === 'boolean') {
      user.isBlocked = validatedData.isBlocked;
      await AuditLog.create({
        userId: adminSession.userId,
        action: validatedData.isBlocked ? 'account_blocked' : 'account_unblocked',
        status: 'success',
        details: { targetUserId },
      });
    }

    await user.save();

    // 3. Security: Invalidate tokens if status or role changed
    if (validatedData.isBlocked || validatedData.roleName) {
      await Token.deleteMany({ userId: targetUserId, type: 'refresh' });
    }

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Admin Update User error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
