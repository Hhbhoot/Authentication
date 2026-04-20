import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { authenticator } from '@/lib/totp';
import QRCode from 'qrcode';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate secret
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.generateURI({
      issuer: 'AuthSystem',
      accountName: user.email,
      secret,
    });
    
    // Save temporary secret to user (but don't enable 2FA yet)
    await User.findByIdAndUpdate(session.userId, { twoFactorSecret: secret });

    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    return NextResponse.json({ 
      qrCodeUrl, 
      secret 
    });
  } catch (error) {
    console.error('2FA Setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
