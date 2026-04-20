import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Token from '@/models/Token';
import { sendPasswordResetEmail } from '@/lib/mail';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      // Security: Don't reveal user existence, but don't send email
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent' });
    }

    // Delete existing reset tokens
    await Token.deleteMany({ userId: user._id, type: 'reset' });

    // Generate new token
    const tokenStr = crypto.randomBytes(32).toString('hex');
    await Token.create({
      userId: user._id,
      token: tokenStr,
      type: 'reset',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    await sendPasswordResetEmail(user.email, tokenStr);

    return NextResponse.json({ message: 'If an account exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
