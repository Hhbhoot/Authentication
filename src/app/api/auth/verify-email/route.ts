import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Token from '@/models/Token';
import { sendVerificationEmail } from '@/lib/mail';
import crypto from 'crypto';

// Confirm Email (Link click)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenStr = searchParams.get('token');

    if (!tokenStr) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    await connectDB();

    // 1. Find token
    const storedToken = await Token.findOne({ 
      token: tokenStr, 
      type: 'verification' 
    });

    if (!storedToken) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // 2. Update user
    const user = await User.findById(storedToken.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.isVerified = true;
    await user.save();

    // 3. Delete token
    await Token.deleteOne({ _id: storedToken._id });

    // Redirect to a success page (frontend)
    return NextResponse.redirect(`${process.env.NEXT_URL}/login?verified=true`);
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Resend Verification Email
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    // Delete existing tokens of same type
    await Token.deleteMany({ userId: user._id, type: 'verification' });

    // Generate new token
    const tokenStr = crypto.randomBytes(32).toString('hex');
    await Token.create({
      userId: user._id,
      token: tokenStr,
      type: 'verification',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    await sendVerificationEmail(user.email, tokenStr);

    return NextResponse.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
