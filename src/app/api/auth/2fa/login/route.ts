import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Role from '@/models/Role';
import { generateTokens, setAuthCookies } from '@/lib/auth';
import { authenticator } from '@/lib/totp';
import AuditLog from '@/models/AuditLog';

export async function POST(req: NextRequest) {
  try {
    const { userId, code } = await req.json();
    if (!userId || !code) {
      return NextResponse.json({ error: 'Missing information' }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    await connectDB();
    const user = await User.findById(userId).select('+twoFactorSecret').populate('role');
    
    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }

    const isValid = await (authenticator as any).verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      await AuditLog.create({
        userId,
        action: 'login_2fa',
        status: 'failure',
        ipAddress,
        userAgent,
        details: { reason: 'invalid_2fa_code' },
      });
      return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 401 });
    }

    // 2FA Success - Generate tokens
    const { accessToken, refreshToken } = await generateTokens(
      { userId: user._id as string, role: user.role.name },
      { ip: ipAddress, userAgent }
    );

    await setAuthCookies(accessToken, refreshToken);

    await AuditLog.create({
      userId,
      action: 'login_2fa',
      status: 'success',
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      message: 'Authenticated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (error) {
    console.error('2FA Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
