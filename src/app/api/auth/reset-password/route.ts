import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Token from '@/models/Token';
import { z } from 'zod';

const resetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = resetSchema.parse(body);

    await connectDB();

    // 1. Find token
    const storedToken = await Token.findOne({ 
      token: validatedData.token, 
      type: 'reset' 
    });

    if (!storedToken) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    // 2. Find user
    const user = await User.findById(storedToken.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Update password (bcrypt hash handled by User model pre-save hook)
    user.password = validatedData.password;
    await user.save();

    // 4. Delete token
    await Token.deleteOne({ _id: storedToken._id });

    return NextResponse.json({ message: 'Password has been reset successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
