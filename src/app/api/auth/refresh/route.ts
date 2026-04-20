import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import { verifyRefreshToken, generateTokens, setAuthCookies, clearAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
    }

    await connectDB();

    // 1. Verify token signature
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      await clearAuthCookies();
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    // 2. Check if token exists in DB (revocation check)
    const storedToken = await Token.findOne({ 
      userId: decoded.userId, 
      token: refreshToken, 
      type: 'refresh' 
    });

    if (!storedToken) {
      // Possible token reuse attack or manual revocation
      await clearAuthCookies();
      return NextResponse.json({ error: 'Refresh token revoked' }, { status: 401 });
    }

    // 3. Delete the used refresh token (Token Rotation)
    await Token.deleteOne({ _id: storedToken._id });

    // 4. Generate new token pair with metadata
    const ip = req.headers.get('x-forwarded-for') || '0.0.0.0';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const tokens = await generateTokens(
      { userId: decoded.userId, role: decoded.role },
      { ip, userAgent }
    );

    await setAuthCookies(tokens.accessToken, tokens.refreshToken);

    return NextResponse.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
