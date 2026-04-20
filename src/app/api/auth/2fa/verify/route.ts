import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import { getCurrentUser } from '@/lib/auth';
import { authenticator } from '@/lib/totp';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(session.userId).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: '2FA setup not initiated' }, { status: 400 });
    }

    const isValid = await authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Officially enable 2FA
    await User.findByIdAndUpdate(session.userId, { isTwoFactorEnabled: true });

    return NextResponse.json({ message: 'Two-factor authentication enabled successfully' });
  } catch (error) {
    console.error('2FA Verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    await User.findByIdAndUpdate(session.userId, { 
      isTwoFactorEnabled: false,
      twoFactorSecret: null 
    });

    return NextResponse.json({ message: 'Two-factor authentication disabled' });
  } catch (error) {
    console.error('2FA Disable error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
